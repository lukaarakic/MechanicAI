// Remix imports
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'

// Components
import { GeneralErrorBoundary } from '~/components/error-boundary'
import Separator from '~/components/ui/separator'

// Utilities
import { requireUser } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  return json({ user })
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const email = formData.get('email')
  const quantity = formData.get('quantity')

  if (!email || !quantity) {
    throw new Error('Something went wrong. Please contact team@mechanicai.app')
  }

  await prisma.user.update({
    where: {
      email: `${email}`,
    },
    data: {
      tokens: {
        increment: +quantity * 10,
      },
    },
  })

  return json({})
}

const Tokens = () => {
  return (
    <div className="w-full">
      <p className="text-18 font-bold">Tokens</p>
      <p>Change your token balance.</p>

      <Separator />
    </div>
  )
}

export default Tokens

export const meta: MetaFunction = () => {
  return [
    { title: 'Tokens | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Tokens | MechanicAI',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
