import { parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json, redirect } from '@remix-run/node'
import { requireUser } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import { CarSchema } from './settings+/car'
import { prisma } from '~/utils/db.server'
import { carStorage } from '~/utils/car.server'

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      CarSchema.transform(async (data) => {
        if (intent !== null) return { ...data, user }

        if (user.car?.id) {
          await prisma.car.update({
            where: {
              userId: user.id,
            },
            data: {
              carBrand: data.carBrand,
              carModel: data.carModel,
              engineSize: data.engineSize,
              fuel: data.fuel,
              power: data.power,
              shifter: data.shifter,
              year: data.year,
            },
          })

          return { ...data }
        }

        if (!user.car?.id) {
          await prisma.car.create({
            data: {
              carBrand: data.carBrand,
              carModel: data.carModel,
              engineSize: data.engineSize,
              fuel: data.fuel,
              power: data.power,
              shifter: data.shifter,
              year: data.year,
              userId: user.id,
            },
          })

          return { ...data }
        }
      }),
    async: true,
  })

  if (submission.status !== 'success' || !submission.value) {
    return json(
      {
        result: submission.reply(),
      },
      {
        status: submission.status === 'error' ? 400 : 200,
      },
    )
  }

  const carSession = await carStorage.getSession(request.headers.get('cookie'))
  carSession.flash('status', submission.status)

  const { redirectUrl } = submission.value

  return redirect(redirectUrl, {
    headers: {
      'set-cookie': await carStorage.commitSession(carSession),
    },
  })
}
