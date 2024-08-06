import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { Label } from '@radix-ui/react-label'
import { Form, useActionData, useSearchParams } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp'
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp'
import { z } from 'zod'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { checkCSRF } from '~/utils/csrf.server'
import { isCodeValid } from '~/utils/verify.server'
import { prisma } from '~/utils/db.server'
import { resetPasswordEmailSessionKey } from './reset-password'
import {
  onboardingEmailSessionKey,
  VerifyFunctionArgs,
} from '~/routes/_auth+/onboarding'
import { invariant } from '~/utils/misc'
import { verifySessionStorage } from '~/utils/verification.server'
import { GeneralErrorBoundary } from '~/components/error-boundary'

export const codeQueryParam = 'code'
export const targetQueryParam = 'target'
export const typeQueryParam = 'type'
export const redirectToQueryParam = 'redirectTo'

const types = ['onboarding', 'reset-password'] as const
const VerificationTypeSchema = z.enum(types)
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>

export const VerificationSchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [targetQueryParam]: z.string(),
  [typeQueryParam]: VerificationTypeSchema,
  [redirectToQueryParam]: z.string().optional(),
})

async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData
) {
  const submission = await parseWithZod(body, {
    schema: () =>
      VerificationSchema.superRefine(async (data, ctx) => {
        const codeIsValid = await isCodeValid({
          code: data[codeQueryParam],
          type: data[typeQueryParam],
          target: data[targetQueryParam],
        })
        if (!codeIsValid) {
          ctx.addIssue({
            path: ['code'],
            code: z.ZodIssueCode.custom,
            message: `Invalid code`,
          })
          return z.NEVER
        }
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

  const { value: submissionValue } = submission

  await prisma.verification.delete({
    where: {
      target_type: {
        target: submissionValue[targetQueryParam],
        type: submissionValue[typeQueryParam],
      },
    },
  })

  switch (submissionValue[typeQueryParam]) {
    case 'reset-password': {
      return handleResetPasswordVerification({ request, body, submission })
    }
    case 'onboarding': {
      return handleOnboardingVerification({ request, body, submission })
    }
  }
}

async function handleOnboardingVerification({
  request,
  submission,
}: VerifyFunctionArgs) {
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

  invariant(submission.value, 'submission.value should be defined by now')
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  verifySession.set(onboardingEmailSessionKey, submission.value.target)

  return redirect('/onboarding', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
    },
  })
}

async function handleResetPasswordVerification({
  request,
  submission,
}: VerifyFunctionArgs) {
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

  const target = submission.value[targetQueryParam]
  const user = await prisma.user.findFirst({
    where: {
      email: target,
    },
    select: {
      email: true,
    },
  })

  if (!user) {
    return json({
      result: submission.reply({ formErrors: ['Invalid code'] }),
    })
  }

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie')
  )
  verifySession.set(resetPasswordEmailSessionKey, user.email)

  return redirect('/reset-password', {
    headers: {
      'set-cookie': await verifySessionStorage.commitSession(verifySession),
    },
  })
}

export async function loader({ request }: LoaderFunctionArgs) {
  const params = new URL(request.url).searchParams
  if (!params.has(codeQueryParam)) {
    return json({
      status: 'idle',
      submission: {
        intent: '',
        payload: Object.fromEntries(params) as Record<string, unknown>,
        error: {} as Record<string, Array<string>>,
      },
    } as const)
  }

  return validateRequest(request, params)
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  await checkCSRF(formData, request)
  return validateRequest(request, formData)
}

const Verify = () => {
  const [searchParams] = useSearchParams()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'otp-form',
    constraint: getZodConstraint(VerificationSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: VerificationSchema })
    },
    defaultValue: {
      code: searchParams.get(codeQueryParam) ?? '',
      target: searchParams.get(targetQueryParam) ?? '',
      type: searchParams.get(typeQueryParam) ?? '',
      redirectTo: searchParams.get(redirectToQueryParam) ?? '',
    },
  })

  return (
    <>
      <div className="text-center mb-4">
        <h1 className="text-24 font-semibold">Check your email</h1>
        <p className="text-16">
          We&ampos;ve sent you a code to verify your email address.
        </p>
      </div>

      <Form
        {...getFormProps(form)}
        method="post"
        className="flex flex-col gap-4"
      >
        <AuthenticityTokenInput />

        <div className="flex items-center flex-col justify-center">
          <div>
            <Label>Code</Label>
            <InputOTP
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
              {...getInputProps(fields[codeQueryParam], { type: 'text' })}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <ErrorList
              id={fields[codeQueryParam].id}
              errors={fields[codeQueryParam].errors}
            />
          </div>
        </div>

        <input {...getInputProps(fields[typeQueryParam], { type: 'hidden' })} />
        <input
          {...getInputProps(fields[targetQueryParam], { type: 'hidden' })}
        />
        <input
          {...getInputProps(fields[redirectToQueryParam], { type: 'hidden' })}
        />

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button className="w-fit mx-auto">Submit</Button>
      </Form>
    </>
  )
}
export default Verify

export const meta: MetaFunction = () => {
  return [{ title: 'Verify | MechanicAI' }]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
