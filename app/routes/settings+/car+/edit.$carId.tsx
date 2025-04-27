import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { ActionFunctionArgs, MetaFunction, redirect } from '@remix-run/node'
import Dropdown from '~/components/ui/dropdown'
import {
  carBrands,
  carModels as carModelsData,
  fuel,
  transmission,
} from '~/data/car-data'
import { useEffect, useState } from 'react'
import Field from '~/components/ui/field'
import Button from '~/components/ui/button'
import { requireUserId } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { invariantResponse } from '~/utils/misc'
import { useToast } from '~/components/ui/use-toast'
import { getFieldsetProps, getFormProps, useForm } from '@conform-to/react'
import ErrorList from '~/components/ui/ErrorList'

const CarSchema = z.object({
  carBrand: z
    .string()
    .min(1, { message: 'Car brand is required' })
    .max(50, { message: 'Car brand must be less than 50 characters' }),
  carModel: z
    .string()
    .min(1, { message: 'Car model is required' })
    .max(50, { message: 'Car model must be less than 50 characters' }),
  carYear: z
    .string()
    .min(1, { message: 'Car year is required' })
    .max(4, { message: 'Car year must be 4 digits' })
    .regex(/^\d{4}$/, { message: 'Car year must be a valid year' }),
  carEngineSize: z
    .string()
    .min(1, { message: 'Car engine size is required' })
    .max(10, { message: 'Car engine size must be less than 10 characters' })
    .regex(/^\d+$/, { message: 'Car engine size must be a number' }),
  carPower: z
    .string()
    .min(1, { message: 'Car power is required' })
    .max(10, { message: 'Car power must be less than 10 characters' })
    .regex(/^\d+$/, { message: 'Car power must be a number' }),
  carFuel: z.string().min(1, { message: 'Car fuel type is required' }),
  carShifter: z.string().min(1, { message: 'Car shifter type is required' }),
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const user = await requireUserId(request)

  const formData = await request.formData()
  // await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      CarSchema.transform(async (data) => {
        if (intent !== null) return { ...data }

        return { ...data }
      }),
    async: true,
  })

  if (submission.status !== 'success') {
    return {
      result: submission.reply(),
      status: submission.status === 'error' ? 400 : 200,
    }
  }

  const car = await prisma.car.update({
    where: { id: params.carId, userId: user },
    data: {
      carBrand: submission.value.carBrand,
      carModel: submission.value.carModel,
      year: submission.value.carYear,
      engineSize: submission.value.carEngineSize,
      power: submission.value.carPower,
      fuel: submission.value.carFuel,
      shifter: submission.value.carShifter,
    },
  })

  invariantResponse(car, 'You must add car information first', { status: 400 })

  return redirect('/settings/car')
}

export const loader = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const car = await prisma.car.findFirstOrThrow({
    where: { id: params.carId, userId: userId },
    select: {
      carBrand: true,
      carModel: true,
      fuel: true,
      engineSize: true,
      power: true,
      shifter: true,
      year: true,
    },
  })

  return car
}

const EditCar = () => {
  const actionData = useActionData<typeof action>()
  const car = useLoaderData<typeof loader>()

  const [form, fields] = useForm({
    id: 'edit-car-form',
    constraint: getZodConstraint(CarSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CarSchema })
    },
  })

  const [carBrand, setCarBrand] = useState(car.carBrand)
  const [carModels, setCarModels] = useState<string[] | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    if (carBrand) {
      const models = carModelsData[carBrand.toLowerCase()]
      setCarModels(models)
    } else {
      setCarModels(null)
    }
  }, [carBrand])

  useEffect(() => {
    if (actionData?.result.status === 'success') {
      toast({
        title: 'Car updated',
        description: 'Selected car has been updated',
        duration: 2000,
      })
    }
  }, [actionData, toast])

  return (
    <Form
      {...getFormProps(form)}
      className="grid max-w-5xl grid-cols-1 items-center justify-center gap-20 md:grid-cols-2"
      method="post"
    >
      <div className="relative isolate z-40">
        <Dropdown
          label="Car Brand"
          defaultValue={car.carBrand}
          placeholder="Choose your car brand"
          suggestions={carBrands}
          setValue={setCarBrand}
          {...getFieldsetProps(fields.carBrand)}
        />
        <ErrorList id={fields.carBrand.id} errors={fields.carBrand.errors} />
      </div>
      <div>
        <Dropdown
          label="Car Model"
          {...getFieldsetProps(fields.carModel)}
          defaultValue={car.carModel}
          placeholder="Choose your car model"
          suggestions={carModels || ['Other - please specify']}
        />
        <ErrorList id={fields.carModel.id} errors={fields.carModel.errors} />
      </div>

      <div>
        <Field
          defaultValue={car.year}
          {...getFieldsetProps(fields.carYear)}
          label="Car Year"
          id={fields.carYear.name}
          placeholder="Car year"
          type="text"
        />
        <ErrorList id={fields.carYear.id} errors={fields.carYear.errors} />
      </div>

      <div className="relative isolate z-0">
        <Dropdown
          label="Fuel Type"
          {...getFieldsetProps(fields.carFuel)}
          defaultValue={car.fuel}
          placeholder="Choose your car fuel type"
          suggestions={fuel}
        />
        <ErrorList id={fields.carFuel.id} errors={fields.carFuel.errors} />
      </div>

      <div>
        <Field
          {...getFieldsetProps(fields.carEngineSize)}
          id={fields.carEngineSize.name}
          defaultValue={car.engineSize}
          label="Engine Size (cc)"
          placeholder="Engine size (cc)"
          type="text"
        />
        <ErrorList
          id={fields.carEngineSize.id}
          errors={fields.carEngineSize.errors}
        />
      </div>

      <div>
        <Field
          defaultValue={car.power}
          {...getFieldsetProps(fields.carPower)}
          label="Car Power (kW)"
          id={fields.carPower.name}
          placeholder="Car Power (kW)"
          type="text"
        />
        <ErrorList id={fields.carPower.id} errors={fields.carPower.errors} />
      </div>

      <div className="relative isolate z-0">
        <Dropdown
          label="Transmission"
          defaultValue={car.shifter}
          {...getFieldsetProps(fields.carShifter)}
          placeholder="Choose your car transmission type"
          suggestions={transmission}
        />
        <ErrorList
          id={fields.carShifter.id}
          errors={fields.carShifter.errors}
        />
      </div>

      <Button className="mb-0.5 self-end">Save changes</Button>
    </Form>
  )
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Edit Car | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'Account Settings | MechanicAI',
    },
  ]
}

export default EditCar
