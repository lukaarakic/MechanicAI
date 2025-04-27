// Remix imports
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'

// Conform imports
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

// React imports
import { useEffect } from 'react'

// UI components
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import Button from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import Field from '~/components/ui/field'
import { Label } from '~/components/ui/label'
import Separator from '~/components/ui/separator'
import { useToast } from '~/components/ui/use-toast'

// Utility functions
import { requireUser } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { invariantResponse } from '~/utils/misc'

// Error boundary
import { GeneralErrorBoundary } from '~/components/error-boundary'

// Zod imports
import { z } from 'zod'

const AccountSchema = z.object({
  firstName: z
    .string()
    .min(3, 'First name must be longer than 3 characters')
    .max(50),
  lastName: z
    .string()
    .min(3, 'Last name must be longer than 3 characters')
    .max(50),
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      AccountSchema.transform(async (data, ctx) => {
        if (intent !== null) return

        const updatedUser = await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
          select: {
            id: true,
          },
        })

        if (!updatedUser) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Something went wrong',
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
      {
        status: submission.status === 'error' ? 400 : 200,
      },
    )
  }

  return json({
    result: submission.reply(),
  })
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  invariantResponse(user, 'Something unexpected happpend', { status: 404 })

  return json({ user })
}

const Account = () => {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const { toast } = useToast()

  const [form, fields] = useForm({
    id: 'account-form',
    constraint: getZodConstraint(AccountSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AccountSchema })
    },
  })

  useEffect(() => {
    if (actionData?.result.status === 'success') {
      toast({
        title: 'Profile updated',
        description: 'Profile has been updated',
        duration: 2000,
      })
    }
  }, [actionData, toast])

  return (
    <div className="w-full">
      <p className="text-18 font-bold">Account</p>
      <p>Update your account settings.</p>

      <Separator />

      <Form className="mb-20 max-w-xl" method="post" {...getFormProps(form)}>
        <AuthenticityTokenInput />

        <div className="flex flex-col gap-20 md:flex-row">
          <div className="w-full">
            <Label htmlFor={fields.firstName.id}>First Name</Label>
            <Field
              placeholder="John"
              {...getInputProps(fields.firstName, {
                type: 'text',
                value: false,
              })}
              defaultValue={user.firstName}
            />
            <ErrorList
              id={fields.firstName.id}
              errors={fields.firstName.errors}
            />
          </div>

          <div className="w-full">
            <Label htmlFor={fields.lastName.id}>Last Name</Label>
            <Field
              placeholder="Smith"
              {...getInputProps(fields.lastName, {
                type: 'text',
                value: false,
              })}
              defaultValue={user.lastName}
            />
            <ErrorList
              id={fields.lastName.id}
              errors={fields.lastName.errors}
            />
          </div>
        </div>
        <Button className="mt-10 block w-full text-right !text-16 md:ml-auto md:w-auto">
          Update profile
        </Button>
      </Form>

      <div className="max-w-xl">
        <Label htmlFor="email">Email</Label>
        <div className="flex flex-col items-center gap-4">
          <Field
            placeholder="name@example.com"
            disabled={true}
            value={user.email}
            id="email"
            type="text"
            name="email"
          />
        </div>
      </div>
    </div>
  )
}
export default Account

export const meta: MetaFunction = () => {
  return [
    { title: 'Account Settings | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Account Settings | MechanicAI',
    },
  ]
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => {
          return <p>No user found</p>
        },
      }}
    />
  )
}
