// Remix imports
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form, json, useActionData } from '@remix-run/react'

// Conform imports
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

// Zod imports
import { z } from 'zod'

// Utility imports
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { checkHoneypot } from '~/utils/honeypot.server'
import { checkCSRF } from '~/utils/csrf.server'
import { EmailSchema } from '~/utils/user-validation'
import { generateTOTP } from '@epic-web/totp'
import { requireAnonymous } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { getDomainUrl } from '~/utils/misc'
import { codeQueryParam, targetQueryParam, typeQueryParam } from './verify'

// Component imports
import Button from '~/components/ui/button'
import Field from '~/components/ui/field'
import ErrorList from '~/components/ui/ErrorList'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import AuthHeader from '~/components/AuthHeader'

// Asset imports
// import GoogleLogo from '~/assets/icons/google-logo.png'

// Email imports (commented out)
import { sendEmail } from '~/utils/email.server'
import EmailTemplate from '~/components/email-template'

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
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const { email } = submission.value

  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: 'SHA256',
    period: 10 * 60,
  })

  const redirectUrl = new URL(`${getDomainUrl(request)}/verify`)

  const type = 'onboarding'
  redirectUrl.searchParams.set(typeQueryParam, type)
  redirectUrl.searchParams.set(targetQueryParam, email)

  const verifyUrl = new URL(redirectUrl)
  verifyUrl.searchParams.set(codeQueryParam, otp)

  const verificationData = {
    type,
    target: email,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000),
  }

  await prisma.verification.upsert({
    where: {
      target_type: { type, target: email },
    },
    create: verificationData,
    update: verificationData,
  })

  const emailSent = await sendEmail({
    to: email,
    subject: `Welcome to MechanicAI!`,
    react: (
      <EmailTemplate
        otp={otp}
        redirectTo={verifyUrl.toString()}
        title="MechanicAI Signup Verfication Code"
      />
    ),
  })

  if (emailSent.status === 'error') {
    console.log(emailSent.error)

    throw new Error('Something went wrong')
  }

  console.log(otp)

  return redirect(redirectUrl.toString())
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
      <AuthHeader
        title="Sign up"
        subtitle="Create your MechanicAI account with your email to sync all solutions
        across your devices"
      />
      {/* 
      <button className="mb-30 box-border flex h-[3.125rem] w-full cursor-pointer items-center justify-center rounded-7 border-2 border-white py-15 text-18 font-medium">
        <img src={GoogleLogo} alt="Google Logo" className="mr-3" />
        Continue with Google
      </button> */}

      {/* <div className="flex w-full items-center justify-center gap-3 opacity-50">
        <div className="h-0.5 w-full bg-white" />
        <span className="text-13 font-semibold">OR</span>
        <div className="h-0.5 w-full bg-white" />
      </div> */}

      <Form {...getFormProps(form)} method="post" className="w-full">
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div>
          <Field
            label="Email"
            placeholder="yourname@example.com"
            {...getInputProps(fields.email, {
              type: 'text',
            })}
          />
          <ErrorList id={fields.email.id} errors={fields.email.errors} />
        </div>

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button className="mt-30 h-[3.125rem] w-full">
          {' '}
          Continue with email
        </Button>
      </Form>
    </>
  )
}
export default Signup

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign up | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Sign up | MechanicAI',
    },
    {
      property: 'og:description',
      content:
        'Sign up for MechanicAI and start diagnosing your car problems. Join our community of car enthusiasts.',
    },
    {
      name: 'description',
      content:
        'Sign up for MechanicAI and start diagnosing your car problems. Join our community of car enthusiasts.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, mechanicai sign up ,car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
