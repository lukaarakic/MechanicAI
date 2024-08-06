import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { Label } from '@radix-ui/react-label'
import {
  ActionFunctionArgs,
  json,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import { Input } from '~/components/ui/input'
import { requireAnonymous } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { sendEmail } from '~/utils/email.server'
import { checkHoneypot } from '~/utils/honeypot.server'
import { EmailSchema } from '~/utils/user-validation'
import { prepareVerification } from '~/utils/verify.server'

const ForgotPasswordSchema = z.object({
  email: EmailSchema,
})

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Forgot Password | MechanicAI',
    },
    {
      property: 'og:description',
      content:
        'Reset your password for MechanicAI. Follow the steps to regain access to your account.',
    },
    {
      name: 'description',
      content:
        'Reset your password for MechanicAI. Follow the steps to regain access to your account.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: () =>
      ForgotPasswordSchema.transform(async (data, ctx) => {
        const user = await prisma.user.findUnique({
          where: {
            email: data.email,
          },
          select: {
            id: true,
          },
        })

        if (!user) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'No user exists with this email',
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

  const user = await prisma.user.findFirstOrThrow({
    where: {
      email,
    },
    select: {
      email: true,
    },
  })

  const { redirectTo, verifyUrl, otp } = await prepareVerification({
    period: 10 * 60,
    request,
    target: email,
    type: 'reset-password',
  })

  await sendEmail({
    to: user.email,
    subject: `MehanicAI Password Reset`,
    text: `${verifyUrl.toString()} ${otp}`,
  })

  console.log(otp)

  return redirect(redirectTo.toString())
}

const ForgotPassword = () => {
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'forgot-password-form',
    constraint: getZodConstraint(ForgotPasswordSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ForgotPasswordSchema })
    },
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
        <Button>Recover password</Button>
      </Form>
    </>
  )
}

export default ForgotPassword

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
