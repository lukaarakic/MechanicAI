import type { ActionFunctionArgs, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  const rawBody = await request.text()
  const params = new URLSearchParams(rawBody)
  const alertName = params.get('alert_name')

  // const subscriptionId = params.get('subscription_id')
  // const status = params.get('status')
  // const nextBillDate = params.get('next_bill_date')

  console.log('🔔 Paddle Webhook:', alertName)

  // TODO: Lookup subscription by ID and update status/nextBillDate
  // For example:
  // await db.subscription.update({ where: { id: subscriptionId }, data: { ... } })

  return json({ received: true })
}

export const loader: LoaderFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 })
  }

  const rawBody = await request.text()
  const params = new URLSearchParams(rawBody)
  const alertName = params.get('alert_name')

  // const subscriptionId = params.get('subscription_id')
  // const status = params.get('status')
  // const nextBillDate = params.get('next_bill_date')

  console.log('🔔 Paddle Webhook:', alertName)

  // TODO: Lookup subscription by ID and update status/nextBillDate
  // For example:
  // await db.subscription.update({ where: { id: subscriptionId }, data: { ... } })

  return json({ received: true })
}
