import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Form, Link, useLoaderData } from '@remix-run/react'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import CarIcon from '~/assets/icons/car-icon.svg?react'
import VerticalDots from '~/assets/icons/vertical-dots.svg?react'
import { cn } from '~/lib/utils'
import { Popover } from 'react-tiny-popover'
import { useState } from 'react'
import { GeneralErrorBoundary } from '~/components/error-boundary'

enum FormNames {
  SET_AS_DEFAULT_FORM = 'setAsDefaultForm',
  DELETE_CAR_FORM = 'deleteCarForm',
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  const formData = await request.formData()
  const formName = formData.get('formName')
  const carId = formData.get('carId')

  if (carId && typeof carId !== 'string') {
    throw new Error('Car ID must be a string')
  }

  switch (formName) {
    case FormNames.SET_AS_DEFAULT_FORM:
      if (carId) {
        await prisma.car.updateMany({
          where: { userId: userId },
          data: { defaultCar: false },
        })
        await prisma.car.update({
          where: { id: carId },
          data: { defaultCar: true },
        })
      }
      break

    case FormNames.DELETE_CAR_FORM:
      if (carId) {
        const cars = await prisma.car.findMany({
          where: { userId: userId },
        })

        if (cars.length <= 1) {
          throw new Error('You must have at least one car')
        }

        const car = await prisma.car.findUnique({
          where: { id: carId },
          select: { defaultCar: true },
        })

        await prisma.car.delete({ where: { id: carId } })

        if (car?.defaultCar) {
          const newDefaultCar = await prisma.car.findFirst({
            where: { userId: userId },
            select: { id: true },
          })

          if (!newDefaultCar) {
            throw new Error('No car found')
          }

          await prisma.car.update({
            where: { id: newDefaultCar.id },
            data: { defaultCar: true },
          })
        }
      }
      break

    default:
      throw new Error('Invalid form name')
  }

  return null
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)

  const cars = await prisma.car.findMany({
    where: { userId: userId },
    orderBy: {
      defaultCar: 'desc',
    },
  })

  return cars
}

const Car = () => {
  const cars = useLoaderData<typeof loader>()
  const [openPopoverCarId, setOpenPopoverCarId] = useState<string | null>(null)

  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-20 md:max-w-5xl md:grid-cols-3">
        {cars.map((car) => (
          <div
            key={car.id}
            className="flex flex-col gap-10 rounded-7 border border-white/15 px-20 py-10 md:max-w-xs"
          >
            <div className="flex items-center justify-between">
              <h2 className="mb-auto">
                <span className="font-bold">
                  {car.carBrand} {car.carModel}
                </span>{' '}
                {car.year}.
              </h2>

              <Popover
                isOpen={openPopoverCarId === car.id}
                positions={['right', 'left', 'bottom', 'top']}
                content={
                  <div className="ml-10 mt-40 min-w-64 overflow-hidden rounded-7 border border-white/25 bg-black">
                    <Form method="post" action="?index">
                      <button
                        type="submit"
                        name="formName"
                        value={FormNames.SET_AS_DEFAULT_FORM}
                        className="w-full border-b border-b-white/25 p-15 font-semibold transition-colors hover:bg-light-gray"
                      >
                        Set as default
                      </button>
                      <input type="hidden" value={car.id} name="carId" />
                    </Form>
                    <Link
                      to={`/settings/car/edit/${car.id}`}
                      className="block w-full border-b border-b-white/25 p-15 text-center font-semibold transition-colors hover:bg-light-gray"
                    >
                      Edit car
                    </Link>
                    <input type="hidden" value={car.id} name="carId" />
                    <Form method="post">
                      <button
                        disabled={cars.length <= 1}
                        type="submit"
                        name="formName"
                        value={FormNames.DELETE_CAR_FORM}
                        className="text-red w-full bg-red-800/50 p-15 font-semibold text-red-500 transition-colors hover:bg-red-800/60 disabled:cursor-not-allowed"
                      >
                        Delete car
                      </button>
                      <input type="hidden" value={car.id} name="carId" />
                    </Form>
                  </div>
                }
                onClickOutside={() => setOpenPopoverCarId(null)}
              >
                <button
                  onClick={() =>
                    setOpenPopoverCarId((prev) =>
                      prev === car.id ? null : car.id,
                    )
                  }
                >
                  <VerticalDots />
                </button>
              </Popover>
            </div>

            <ul>
              <li>{car.fuel}</li>
              <li>{car.engineSize}cc</li>
              <li>{car.power}kW</li>
              <li>{car.shifter}</li>
            </ul>

            <div className="flex items-center justify-between">
              <div></div>
              <CarIcon
                className={cn(
                  'w-25',
                  car.defaultCar ? 'fill-blue-700' : 'fill-white',
                )}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Car Settings | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Account Settings | MechanicAI',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}

export default Car
