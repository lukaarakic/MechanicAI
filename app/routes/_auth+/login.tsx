import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import {
  Form,
  json,
  Link,
  useActionData,
  useSearchParams,
} from '@remix-run/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Utils
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { safeRedirect } from 'remix-utils/safe-redirect'
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
import { GeneralErrorBoundary } from '~/components/error-boundary'

const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
})

export const meta: MetaFunction = () => {
  return [
    { title: 'Login | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Login | MechanicAI',
    },
    {
      property: 'og:description',
      content:
        'Login to MechanicAI to diagnose your car problems. Answer a few questions and get expert insights into possible causes.',
    },
    {
      name: 'description',
      content:
        'Login to MechanicAI to diagnose your car problems. Answer a few questions and get expert insights into possible causes.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)

  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const formData = await request.formData()

  checkHoneypot(formData)
  await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      LoginSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data, user: null }

        const userWithPassword = await prisma.user.findUnique({
          select: {
            id: true,
            password: {
              select: {
                hash: true,
              },
            },
          },
          where: { email: data.email },
        })
        if (!userWithPassword || !userWithPassword.password) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid username or password',
          })
          return z.NEVER
        }

        const isValid = await bcrypt.compare(
          data.password,
          userWithPassword.password.hash
        )

        if (!isValid) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid username or password',
          })

          return z.NEVER
        }

        return { ...data, user: { id: userWithPassword.id } }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value.user) {
    return json(
      {
        result: submission.reply({
          hideFields: ['password'],
        }),
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      }
    )
  }

  const { user, redirectTo } = submission.value
  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie')
  )
  cookieSession.set('userId', user.id)

  return redirect(safeRedirect(redirectTo), {
    headers: {
      'set-cookie': await sessionStorage.commitSession(cookieSession),
    },
  })
}

const Login = () => {
  const actionData = useActionData<typeof action>()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const [form, fields] = useForm({
    id: 'login-form',
    constraint: getZodConstraint(LoginSchema),
    defaultValue: { redirectTo },
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: LoginSchema })
    },
  })

  return (
    <>
      <Button variant={'ghost'} className="absolute right-8 top-8">
        <Link to={'/signup'}>Sign up</Link>
      </Button>

      <div className="text-center mb-4">
        <h1 className="text-24 font-semibold">Login</h1>
        <p className="text-16">
          Enter your details below to log into your account
        </p>
      </div>

      <Form
        aria-label="login"
        method="post"
        className="flex flex-col gap-4"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            placeholder="name@example.com"
            {...getInputProps(fields.email, { type: 'text' })}
          />
          <ErrorList id={fields.email.id} errors={fields.email.errors} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            placeholder="********"
            {...getInputProps(fields.password, { type: 'password' })}
          />
          <ErrorList id={fields.password.id} errors={fields.password.errors} />
        </div>

        <input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button>Login</Button>
      </Form>
    </>
  )
}
export default Login

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
