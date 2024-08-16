import { useEffect, useState } from 'react'

import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

import { AuthenticityTokenInput } from 'remix-utils/csrf/react'

import { Combobox } from '~/components/ui/combobox'
import ErrorList from '~/components/ui/ErrorList'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { useToast } from '~/components/ui/use-toast'
import StatusButton from '~/components/ui/status-button'

import { fuel as fuelData, shifter as shifterData } from '~/data/car-data'

import { requireUser } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

import { z } from 'zod'
import { GeneralErrorBoundary } from '~/components/error-boundary'

import { type action } from '~/routes/update-car'
import { carStorage } from '~/utils/car.server'

export const CarSchema = z.object({
  carBrand: z.string().min(2),
  carModel: z.string(),
  year: z.string(),
  fuel: z.string(),
  engineSize: z.string(),
  power: z.string(),
  shifter: z.string(),

  redirectUrl: z.string(),
})

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  const userCar = await prisma.car.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      carBrand: true,
      carModel: true,
      engineSize: true,
      fuel: true,
      power: true,
      shifter: true,
      year: true,
    },
  })

  const carSession = await carStorage.getSession(request.headers.get('cookie'))
  const status = carSession.get('status')

  return json(
    { userCar, status },
    {
      headers: {
        'set-cookie': await carStorage.commitSession(carSession),
      },
    },
  )
}

const Car = () => {
  const actionData = useActionData<typeof action>()
  const { userCar, status: formStatus } = useLoaderData<typeof loader>()

  const navigation = useNavigation()
  const isSubmitting = navigation.formAction === '/update-car'

  const { toast } = useToast()

  const [fuel, setFuel] = useState(userCar?.fuel || '')
  const [shifter, setShifter] = useState(userCar?.shifter || '')

  const [form, fields] = useForm({
    id: 'car-form',
    constraint: getZodConstraint(CarSchema),
    lastResult: actionData?.result,
    defaultValue: {
      redirectUrl: '/settings/car',
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CarSchema })
    },
  })

  useEffect(() => {
    if (formStatus === 'success') {
      toast({
        title: 'Car details updated',
        description: 'Car details has been updated',
      })
    }
  }, [formStatus, toast])

  return (
    <>
      <h1 className="text-18 font-semibold">Car details</h1>
      <p className="slate-600 text-14">
        With your car details we can give you better answers
      </p>

      <Separator className="my-5" />

      <Form
        className="space-y-4"
        method="post"
        action="/update-car"
        {...getFormProps(form)}
      >
        <AuthenticityTokenInput />

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={fields.carBrand.id}>Car brand</Label>
          <Input
            placeholder="BMW, Volkswagen, Audi"
            {...getInputProps(fields.carBrand, { type: 'text', value: false })}
            defaultValue={userCar?.carBrand}
          />
          <ErrorList id={fields.carBrand.id} errors={fields.carBrand.errors} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={fields.carModel.id}>Car model</Label>
          <Input
            placeholder="M5, Golf 4, S4"
            {...getInputProps(fields.carModel, { type: 'text', value: false })}
            defaultValue={userCar?.carModel}
          />
          <ErrorList id={fields.carModel.id} errors={fields.carModel.errors} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={fields.year.id}>Year</Label>
          <Input
            placeholder="2020"
            {...getInputProps(fields.year, { type: 'text', value: false })}
            defaultValue={userCar?.year}
          />
          <ErrorList id={fields.year.id} errors={fields.year.errors} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Fuel</Label>
          <Input
            placeholder="2020"
            className="hidden"
            {...getInputProps(fields.fuel, { type: 'text', value: false })}
            defaultValue={fuel}
          />
          <Combobox
            data={fuelData}
            title="Select fuel..."
            value={fuel}
            setValue={setFuel}
          />
          <ErrorList id={fields.fuel.id} errors={fields.fuel.errors} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={fields.engineSize.id}>Engine size</Label>
          <Input
            placeholder="2000cc"
            {...getInputProps(fields.engineSize, {
              type: 'text',
              value: false,
            })}
            defaultValue={userCar?.engineSize}
          />
          <ErrorList
            id={fields.engineSize.id}
            errors={fields.engineSize.errors}
          />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={fields.power.id}>Power</Label>
          <Input
            placeholder="288kW"
            {...getInputProps(fields.power, { type: 'text', value: false })}
            defaultValue={userCar?.power}
          />
          <ErrorList id={fields.power.id} errors={fields.power.errors} />
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label>Shifter</Label>
          <Input
            placeholder="2020"
            className="hidden"
            {...getInputProps(fields.shifter, { type: 'text', value: false })}
            defaultValue={shifter}
          />
          <Combobox
            data={shifterData}
            title="Select shifter..."
            value={shifter}
            setValue={setShifter}
          />
          <ErrorList id={fields.shifter.id} errors={fields.shifter.errors} />
        </div>

        <Input {...getInputProps(fields.redirectUrl, { type: 'hidden' })} />

        <StatusButton pendingText="Saving..." isPending={isSubmitting}>
          Save
        </StatusButton>
      </Form>
    </>
  )
}
export default Car

export const meta: MetaFunction = () => {
  return [
    { title: 'Car Settings | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Car Settings | MechanicAI',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
