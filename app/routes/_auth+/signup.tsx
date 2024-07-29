import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, json, Link, useActionData } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Utils
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { checkHoneypot } from '~/utils/honeypot.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { sessionStorage } from '~/utils/session.server'
import { EmailSchema, PasswordSchema } from '~/utils/user-validation'

// Components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ErrorList from '~/components/ui/ErrorList'
import { requireAnonymous } from '~/utils/auth.server'

const SignupSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  email: EmailSchema,
  password: PasswordSchema,
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)

  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: SignupSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: data.email,
        },
        select: { id: true },
      })

      if (existingUser) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'A user alreay exists with this email',
        })

        return
      }
    }).transform(async (data) => {
      const { email, firstName, lastName, password } = data

      const user = await prisma.user.create({
        select: { id: true },
        data: {
          email: email.toLowerCase(),
          firstName,
          lastName,
          password: {
            create: {
              hash: await bcrypt.hash(password, 10),
            },
          },
          avatar: `https://api.dicebear.com/9.x/thumbs/svg?seed=${firstName}`,
          tokens: 10,
        },
      })

      return { ...data, user }
    }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    )
  }

  const { user } = submission.value

  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie')
  )
  cookieSession.set('userId', user.id)

  return redirect('/', {
    headers: {
      'set-cookie': await sessionStorage.commitSession(cookieSession),
    },
  })
}

const Signup = () => {
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'signup-form',
    constraint: getZodConstraint(SignupSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignupSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <>
      <Button variant={'ghost'} className="absolute right-8 top-8">
        <Link to={'/login'}>Login</Link>
      </Button>

      <div className="text-center mb-4">
        <h1 className="text-24 font-semibold">Create an account</h1>
        <p className="text-16">
          Enter your details below to create your account
        </p>
      </div>

      <Form
        {...getFormProps(form)}
        method="post"
        className="flex flex-col gap-4"
      >
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div className="flex w-full justify-between gap-4">
          <div className="w-full">
            <Label>First Name</Label>
            <Input
              placeholder="John"
              {...getInputProps(fields.firstName, {
                type: 'text',
              })}
            />
            <ErrorList
              id={fields.firstName.id}
              errors={fields.firstName.errors}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              placeholder="Smith"
              {...getInputProps(fields.lastName, {
                type: 'text',
              })}
            />
            <ErrorList
              id={fields.lastName.id}
              errors={fields.lastName.errors}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            placeholder="name@example.com"
            {...getInputProps(fields.email, {
              type: 'text',
            })}
          />
          <ErrorList id={fields.email.id} errors={fields.email.errors} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            placeholder="********"
            {...getInputProps(fields.password, {
              type: 'password',
            })}
          />
          <ErrorList id={fields.password.id} errors={fields.password.errors} />
        </div>

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button>Sign up</Button>
      </Form>
    </>
  )
}
export default Signup
