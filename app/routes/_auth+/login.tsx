// Remix imports
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

// Third-party libraries
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Conform utilities
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'

// Remix utilities
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { safeRedirect } from 'remix-utils/safe-redirect'

// Server-side utilities
import { checkHoneypot } from '~/utils/honeypot.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { sessionStorage } from '~/utils/session.server'
import { EmailSchema, PasswordSchema } from '~/utils/user-validation'
import { requireAnonymous } from '~/utils/auth.server'

// Components
import Button from '~/components/ui/button'
import Field from '~/components/ui/field'
import ErrorList from '~/components/ui/ErrorList'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import AuthHeader from '~/components/AuthHeader'
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt'

// Assets
// import GoogleLogo from '~/assets/icons/google-logo.png'

const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)

  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  try {
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
            userWithPassword.password.hash,
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
        },
      )
    }

    const { user, redirectTo } = submission.value
    const cookieSession = await sessionStorage.getSession(
      request.headers.get('cookie'),
    )
    cookieSession.set('userId', user.id)

    return redirect(safeRedirect(redirectTo), {
      headers: {
        'set-cookie': await sessionStorage.commitSession(cookieSession),
      },
    })
  } catch (error) {
    console.log('ACTION', error)
  }
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
      <AuthHeader
        title="Login"
        subtitle="Use your email to login into your account"
      />
      {/* <Button variant="outline" className="mb-30 w-full">
        <img src={GoogleLogo} alt="Google Logo" className="mr-3" />
        Login with Google
      </Button> */}

      {/* <div className="flex w-full items-center justify-center gap-3 opacity-50">
        <div className="h-0.5 w-full bg-white" />
        <span className="text-13 font-semibold">OR</span>
        <div className="h-0.5 w-full bg-white" />
      </div> */}

      <Form
        aria-label="Login Form"
        method="post"
        className="w-full"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div className="mb-25">
          <Field
            label="Email"
            placeholder="yourname@example.com"
            className="w-full border"
            {...getInputProps(fields.email, { type: 'text' })}
          />
          <ErrorList id={fields.email.id} errors={fields.email.errors} />
        </div>

        <div className="mb-25">
          <Field
            label="Password"
            placeholder="Enter your password"
            className="w-full border"
            {...getInputProps(fields.password, { type: 'password' })}
          />
          <ErrorList id={fields.password.id} errors={fields.password.errors} />
        </div>

        <Link
          to={'/forgot-password'}
          className="block text-right text-blue-700 transition-colors hover:text-blue-500"
        >
          Forgot password?
        </Link>

        <Field {...getInputProps(fields.redirectTo, { type: 'hidden' })} />

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button className="mt-30 h-[3.125rem] w-full" type="submit">
          Login
        </Button>
      </Form>
    </>
  )
}
export default Login

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

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
