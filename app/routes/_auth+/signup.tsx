import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from '@remix-run/node'
import { Form, json, Link, useActionData } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { z } from 'zod'

// Utils
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { checkHoneypot } from '~/utils/honeypot.server'
import { checkCSRF } from '~/utils/csrf.server'
import { EmailSchema } from '~/utils/user-validation'

// Components
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import ErrorList from '~/components/ui/ErrorList'
import { requireAnonymous } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { verifySessionStorage } from '~/utils/verification.server'
import { onboardingEmailSessionKey } from './onboarding'

const SignupSchema = z.object({
  email: EmailSchema,
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
    schema: (intent) =>
      SignupSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data }

        const existingEmail = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
          select: {
            email: true,
          },
        })

        if (existingEmail) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Email is already in use',
          })

          return z.NEVER
        }

        return { ...data }
      }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const { email } = submission.value

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  verifySession.set(onboardingEmailSessionKey, email)

  return redirect('/onboarding', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
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

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button>Sign up</Button>
      </Form>
    </>
  )
}
export default Signup
