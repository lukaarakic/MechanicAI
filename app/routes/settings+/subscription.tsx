// Remix imports
import { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useEffect, useState } from 'react'

// Components
import { GeneralErrorBoundary } from '~/components/error-boundary'
import Button from '~/components/ui/button'
import Separator from '~/components/ui/separator'

// Utilities
import { requireUser } from '~/utils/auth.server'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { useFetcher, useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  return { user }
}

const Subscription = () => {
  const { user } = useLoaderData<typeof loader>()
  const [paddle, setPaddle] = useState<Paddle>()
  const fetcher = useFetcher()

  useEffect(() => {
    initializePaddle({
      environment: 'sandbox',
      token: 'test_ce08f28e1668b66c0efc06a885f',
      checkout: {
        settings: {
          theme: 'dark',
          allowedPaymentMethods: ['card', 'paypal', 'google_pay', 'apple_pay'],
          showAddDiscounts: true,
        },
      },
      eventCallback: function (data) {
        if (data.name == 'checkout.completed') {
          console.log(data)

          const formData = new FormData()
          formData.append('userId', user.id)

          fetcher.submit(formData, {
            action: '/pay',
            method: 'post',
          })
        }
      },
    }).then((paddleInstance: Paddle | undefined) => {
      if (paddleInstance) {
        setPaddle(paddleInstance)
      }
    })
  }, [])

  const openCheckout = () => {
    paddle?.Checkout.open({
      items: [{ priceId: 'pri_01jt3qgrm0p1672b41p2sm1977', quantity: 1 }],
    })
  }

  return (
    <div className="w-full">
      <p className="text-18 font-bold">Subscription</p>
      <p>Manage your subscription</p>

      <Separator />

      <div className="flex max-w-96 flex-col gap-20 rounded-7 border border-white/15 bg-black p-20">
        <div className="itmes-center flex justify-between">
          <p>MechanicAI subscription</p>
          <span>$7/month</span>
        </div>

        <ul className="mb-40 list-disc gap-10 pl-20 text-white/60">
          <li>Unlimited AI car issue checks</li>
          <li>Instant repair insights</li>
          <li>Repair cost estimation</li>
          <li>Smart diagnostic history logs</li>
        </ul>

        {user.subscription?.status === 'ACTIVE' ? (
          <Button
            className="cursor-default py-5 text-14"
            data-theme="dark"
            disabled
          >
            Subscribe
          </Button>
        ) : (
          <Button className="py-5 text-14" onClick={openCheckout}>
            Subscribe
          </Button>
        )}
      </div>
    </div>
  )
}

export default Subscription

export const meta: MetaFunction = () => {
  return [
    { title: 'Subscription | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Tokens | MechanicAI',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
