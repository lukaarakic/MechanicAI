import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { Separator } from '~/components/ui/separator'
import { requireUser } from '~/utils/auth.server'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { useEffect, useState } from 'react'
import { Combobox } from '~/components/ui/combobox'
import { Button } from '~/components/ui/button'
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
  const { user } = useLoaderData<typeof loader>()
  const [paddle, setPaddle] = useState<Paddle>()
  const [tokens, setTokens] = useState<string>('')
  const [tokensPrice, setTokensPrice] = useState(3)
  const fetcher = useFetcher()

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: import.meta.env.VITE_PADDLE_CLIENT_KEY,
      eventCallback: function (data) {
        if (data.name == 'checkout.completed') {
          console.log(data)

          const formData = new FormData()
          formData.append('email', user.email)
          formData.append('quantity', `${data.data?.items[0].quantity}`)
          fetcher.submit(formData, {
            method: 'POST',
          })
        }
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance)
      }

      paddle
        ?.PricePreview({
          items: [
            { quantity: 1, priceId: import.meta.env.VITE_PADDLE_PRICE_ID },
          ],
        })
        .then((result) => {
          const item = result.data.details.lineItems.flat()
          setTokensPrice(+item[0].price.unitPrice.amount / 100)
        })
        .catch((error) => {
          console.log(error)
        })
    })
  }, [])

  const items = []

  for (let i = 1; i <= 10; i++)
    items.push({
      label: `${i * 10} for $${(tokensPrice * i).toFixed(2)}`,
      value: `${i}`,
    })

  const openCheckout = (quantity: number) => {
    paddle?.Checkout.open({
      items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID, quantity }],
      customer: {
        email: user.email,
      },
    })
  }

  return (
    <>
      <h1 className="text-18 font-semibold">Tokens</h1>
      <p className="slate-600 text-14">Change your token balance.</p>

      <Separator className="my-5" />

      <span>
        Your available tokens:{' '}
        <span className="font-medium">{user.tokens}</span>
      </span>

      <div className="mb-2 mt-6 flex flex-col gap-2">
        <p>Select the amount to buy</p>
        <Combobox
          data={items}
          title="Amount"
          value={tokens}
          setValue={setTokens}
        />
      </div>

      <p className="mb-4">
        Your new tokens balance will be:{' '}
        <span className="font-medium">{user.tokens + +tokens * 10}</span>
      </p>

      <Button onClick={() => openCheckout(+tokens)}>Buy tokens</Button>
    </>
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
