import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Label } from '@radix-ui/react-label'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import { Input } from '~/components/ui/input'
import { PasswordSchema } from '~/utils/user-validation'
import { verifySessionStorage } from '~/utils/verification.server'
import { requireAnonymous, resetUserPassword } from '~/utils/auth.server'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export const resetPasswordEmailSessionKey = 'resetPasswordEmail'

const ResetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine(({ confirmPassword, password }) => password === confirmPassword, {
    message: 'The passwords did not match',
    path: ['confirmPassword'],
  })

async function requireResetPasswordEmail(request: Request) {
  await requireAnonymous(request)

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  const resetPasswordEmail = verifySession.get(resetPasswordEmailSessionKey)

  if (typeof resetPasswordEmail !== 'string' || !resetPasswordEmail) {
    throw redirect('/login')
  }

  return resetPasswordEmail
}

export async function loader({ request }: LoaderFunctionArgs) {
  const resetPasswordEmail = await requireResetPasswordEmail(request)
  return json({ resetPasswordEmail })
}

export async function action({ request }: ActionFunctionArgs) {
  const resestPasswordEmail = await requireResetPasswordEmail(request)
  const formData = await request.formData()
  const submission = parseWithZod(formData, {
    schema: ResetPasswordSchema,
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

  const { password } = submission.value

  await resetUserPassword({ email: resestPasswordEmail, password })

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )

  return redirect('/login', {
    headers: {
      'set-cookie': await verifySessionStorage.destroySession(verifySession),
    },
  })
}

const RestPassword = () => {
  const [form, fields] = useForm({
    id: 'reset-passoword-form',
    constraint: getZodConstraint(ResetPasswordSchema),
    // lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ResetPasswordSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <>
      <div className="text-center mb-4">
        <h1 className="text-24 font-semibold">Forgot password</h1>
        <p className="text-16">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      <Form
        {...getFormProps(form)}
        method="post"
        className="flex flex-col gap-4"
      >
        <AuthenticityTokenInput />

        <div>
          <Label htmlFor={fields.password.id}>New password</Label>
          <Input {...getInputProps(fields.password, { type: 'password' })} />

          <Label htmlFor={fields.confirmPassword.id}>Confirm password</Label>

          <Input
            {...getInputProps(fields.confirmPassword, { type: 'password' })}
          />
        </div>

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button>Recover password</Button>
      </Form>
    </>
  )
}

export default RestPassword

export const meta: MetaFunction = () => {
  return [
    { title: 'Reset Password | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Reset Password | MechanicAI',
    },
    {
      property: 'og:description',
      content: 'Create a new password for your MechanicAI account.',
    },
    {
      name: 'description',
      content: 'Create a new password for your MechanicAI account.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, mechanicai reset password ,car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
