import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { Separator } from '~/components/ui/separator'
import { requireUser } from '~/utils/auth.server'
import { invariantResponse } from '~/utils/misc'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)
  invariantResponse(user, 'You need to login first', { status: 401 })

  return json({ user })
}

const Tokens = () => {
  const { user } = useLoaderData<typeof loader>()

  return (
    <>
      <h1 className="text-18 font-semibold">Tokens</h1>
      <p className="slate-600 text-14">Change your token balance.</p>

      <Separator className="my-5" />

      <span className="font-semibold">
        Your available tokens: {user.tokens}
      </span>
    </>
  )
}
export default Tokens
