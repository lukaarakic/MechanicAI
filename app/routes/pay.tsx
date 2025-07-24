import { ActionFunctionArgs } from '@remix-run/node'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const userId = formData.get('userId')
  const currentUserId = await requireUserId(request)

  if (!userId || currentUserId !== userId) {
    throw new Error(
      'Something went wrong. Please contact us at contact@mechanicai.app',
    )
  }

  await prisma.user.update({
    where: {
      id: `${userId}`,
    },
    data: {
      subscription: {
        upsert: {
          where: {
            userId: `${userId}`,
          },
          create: {
            status: 'ACTIVE',
            nextBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          update: {
            status: 'ACTIVE',
            nextBillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    },
  })

  return null
}

export async function loader() {
  return null
}
