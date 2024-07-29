import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { useToast } from '~/components/ui/use-toast'
import { requireUser } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { invariantResponse } from '~/utils/misc'

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
      }
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
      })
    }
  }, [actionData, toast])

  return (
    <>
      <h1 className="text-18 font-semibold">Account</h1>
      <p className="slate-600 text-14">
        Update your account settings. Set you preferred e-mail and change
        password.
      </p>

      <Separator className="my-5" />

      <Form
        className="flex flex-col gap-4 mb-4"
        method="post"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />

        <div className="flex w-full justify-between gap-4 items-end">
          <div className="w-full">
            <Label htmlFor={fields.firstName.id}>First Name</Label>
            <Input
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
            <Input
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

          <Button className="w-fit">Save</Button>
        </div>
      </Form>

      <Form className="mb-4">
        <Label htmlFor="email">Email</Label>
        <div className="flex items-center gap-4">
          <Input
            placeholder="name@example.com"
            id="email"
            disabled={true}
            value={user.email}
          />
          <Button>Change email</Button>
        </div>
      </Form>

      <Form className="flex flex-col gap-2 mb-5">
        <Label htmlFor="password">Password</Label>
        <Button variant={'destructive'} className="w-fit">
          Change password
        </Button>
      </Form>
    </>
  )
}
export default Account

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
