import Dropdown from '~/components/ui/dropdown'
import ErrorList from '~/components/ui/ErrorList'
import Field from '~/components/ui/field'
import { getFieldsetProps, getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { CarSchema } from '~/routes/settings+/car+/add'
import {
  carBrands,
  carModels as carModelsData,
  fuel,
  transmission,
} from '~/data/car-data'
import { useEffect, useState } from 'react'
import Button from '~/components/ui/button'
import { useFetcher } from '@remix-run/react'

const OnboardingModal = () => {
  const fetcher = useFetcher()

  const [carBrand, setCarBrand] = useState('')
  const [carModels, setCarModels] = useState<string[] | null>(null)

  const [form, fields] = useForm({
    id: 'add-car-form',
    constraint: getZodConstraint(CarSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CarSchema })
    },
  })

  useEffect(() => {
    if (carBrand) {
      const models = carModelsData[carBrand.toLowerCase()]
      setCarModels(models)
    } else {
      setCarModels(null)
    }
  }, [carBrand])

  return (
    <div className="fixed z-50 h-dvh w-full bg-black/70">
      <div className="mx-auto flex h-full w-full items-center justify-center text-white">
        <div className="h-[70dvh] w-[90vw] overflow-y-scroll rounded-7 border border-white/15 bg-black p-40 md:h-auto md:w-auto md:overflow-hidden">
          <h2 className="text-xl font-semibold text-white">
            Just one more step
          </h2>
          <p className="mb-40 mt-1 text-sm text-white/60">
            Add your car details so we can get you accurate diagnostics.
          </p>

          <fetcher.Form
            action="/settings/car/add"
            {...getFormProps(form)}
            className="grid max-w-5xl grid-cols-1 items-center justify-center gap-20 md:grid-cols-2"
            method="post"
          >
            <div className="relative isolate z-50">
              <Dropdown
                label="Car Brand"
                placeholder="Choose your car brand"
                suggestions={carBrands}
                setValue={setCarBrand}
                {...getFieldsetProps(fields.carBrand)}
              />
              <ErrorList
                id={fields.carBrand.id}
                errors={fields.carBrand.errors}
              />
            </div>
            <div>
              <Dropdown
                label="Car Model"
                {...getFieldsetProps(fields.carModel)}
                placeholder="Choose your car model"
                suggestions={carModels || ['Other - please specify']}
              />
              <ErrorList
                id={fields.carModel.id}
                errors={fields.carModel.errors}
              />
            </div>
            <div>
              <Field
                {...getFieldsetProps(fields.carYear)}
                label="Car Year"
                id={fields.carYear.name}
                placeholder="Car year"
                type="text"
              />
              <ErrorList
                id={fields.carYear.id}
                errors={fields.carYear.errors}
              />
            </div>
            <div className="relative isolate z-0">
              <Dropdown
                label="Fuel Type"
                {...getFieldsetProps(fields.carFuel)}
                placeholder="Choose your car fuel type"
                suggestions={fuel}
              />
              <ErrorList
                id={fields.carFuel.id}
                errors={fields.carFuel.errors}
              />
            </div>
            <div>
              <Field
                {...getFieldsetProps(fields.carEngineSize)}
                id={fields.carEngineSize.name}
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
                {...getFieldsetProps(fields.carPower)}
                label="Car Power (kW)"
                id={fields.carPower.name}
                placeholder="Car Power (kW)"
                type="text"
              />
              <ErrorList
                id={fields.carPower.id}
                errors={fields.carPower.errors}
              />
            </div>
            <div className="relative isolate z-0">
              <Dropdown
                label="Transmission"
                {...getFieldsetProps(fields.carShifter)}
                placeholder="Transmission type"
                suggestions={transmission}
              />
              <ErrorList
                id={fields.carShifter.id}
                errors={fields.carShifter.errors}
              />
            </div>
            <Button className="mb-0.5 self-end">Add Car</Button>
          </fetcher.Form>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
