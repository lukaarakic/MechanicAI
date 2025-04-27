// Remix Imports
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form, json, useActionData } from '@remix-run/react'

// Conform Imports
import {
  getFormProps,
  getInputProps,
  Submission,
  useForm,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

// Third-Party Libraries
import { z } from 'zod'
import bcrypt from 'bcryptjs'

// Utils
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { checkHoneypot } from '~/utils/honeypot.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { sessionStorage } from '~/utils/session.server'
import { PasswordSchema } from '~/utils/user-validation'
import { requireAnonymous } from '~/utils/auth.server'
import { verifySessionStorage } from '~/utils/verification.server'
import { VerificationSchema } from './verify'

// Components
import Button from '~/components/ui/button'
import Field from '~/components/ui/field'
import ErrorList from '~/components/ui/ErrorList'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import AuthHeader from '~/components/AuthHeader'

export const onboardingEmailSessionKey = 'onboardingEmail'

export type VerifyFunctionArgs = {
  request: Request
  submission: Submission<z.infer<typeof VerificationSchema>>
  body: FormData | URLSearchParams
}

const OnboardingSchema = z.object({
  firstName: z.string().min(3).max(50),
  lastName: z.string().min(3).max(50),
  password: PasswordSchema,
})

async function requireOnboardingEmail(request: Request) {
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const email = verifySession.get(onboardingEmailSessionKey)

  if (typeof email !== 'string' || !email) {
    throw redirect('/signup')
  }

  return email
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request)
  await requireOnboardingEmail(request)

  return json({})
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request)
  const email = await requireOnboardingEmail(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)
  checkHoneypot(formData)

  const submission = await parseWithZod(formData, {
    schema: OnboardingSchema.transform(async (data) => {
      const { firstName, lastName, password } = data

      const user = await prisma.user.create({
        select: { id: true },
        data: {
          email,
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
      },
    )
  }

  const { user } = submission.value

  const cookieSession = await sessionStorage.getSession(
    request.headers.get('cookie'),
  )
  cookieSession.set('userId', user.id)

  const verifySession = await verifySessionStorage.getSession(
    request.headers.get('cookie'),
  )
  const headers = new Headers()

  headers.append(
    'set-cookie',
    await sessionStorage.commitSession(cookieSession),
  )
  headers.append(
    'set-cookie',
    await verifySessionStorage.destroySession(verifySession),
  )

  return redirect('/', {
    headers,
  })
}

const Onboarding = () => {
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'signup-form',
    constraint: getZodConstraint(OnboardingSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: OnboardingSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <>
      <AuthHeader
        title="Register"
        subtitle="Enter your credentials to create an account"
      />

      <Form {...getFormProps(form)} method="post" className="w-full">
        <AuthenticityTokenInput />
        <HoneypotInputs />

        <div className="mb-20 flex w-full flex-col gap-5 lg:flex-row">
          <div className="w-full">
            <Field
              label="First Name"
              placeholder="John"
              {...getInputProps(fields.firstName, {
                type: 'text',
              })}
              className="w-full lg:w-[14.375rem]"
            />
            <ErrorList
              id={fields.firstName.id}
              errors={fields.firstName.errors}
            />
          </div>
          <div className="w-full">
            <Field
              label="Last Name"
              placeholder="Smith"
              {...getInputProps(fields.lastName, {
                type: 'text',
              })}
              className="w-full lg:w-[14.375rem]"
            />
            <ErrorList
              id={fields.lastName.id}
              errors={fields.lastName.errors}
            />
          </div>
        </div>

        <div className="mb-40">
          <Field
            label="Password"
            placeholder="********"
            {...getInputProps(fields.password, {
              type: 'password',
            })}
          />
          <ErrorList id={fields.password.id} errors={fields.password.errors} />
        </div>

        <ErrorList id={form.errorId} errors={form.errors} />
        <Button className="w-full">Create an account</Button>
      </Form>
    </>
  )
}
export default Onboarding

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Onboaring | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Onboaring | MechanicAI',
    },
    {
      property: 'og:description',
      content:
        'Complete the onboarding process for MechanicAI. Get started with diagnosing your car problems.',
    },
    {
      name: 'description',
      content:
        'Complete the onboarding process for MechanicAI. Get started with diagnosing your car problems.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}
