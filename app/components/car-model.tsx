// import { getFormProps, getInputProps, useForm } from '@conform-to/react'
// import { getZodConstraint, parseWithZod } from '@conform-to/zod'
// import { Label } from '@radix-ui/react-label'
// import { Form, useActionData, useNavigation } from '@remix-run/react'
// import { useState } from 'react'
// import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
// import ErrorList from './ui/ErrorList'
// import { Combobox } from './ui/combobox'
// import { type action } from '~/routes/update-car'
// import { fuel as fuelData, shifter as shifterData } from '~/data/car-data'
// import { Car } from '@prisma/client'
// import { CarSchema } from '~/routes/settings+/car'
// import StatusButton from './ui/status-button'
// import Field from './ui/field'

// const CarModal = ({ userCar }: { userCar: Car | null }) => {
//   const actionData = useActionData<typeof action>()

//   const [fuel, setFuel] = useState(userCar?.fuel || '')
//   const [shifter, setShifter] = useState(userCar?.shifter || '')

//   const navigation = useNavigation()
//   const isSubmitting = navigation.formAction === '/update-car'

//   const [form, fields] = useForm({
//     id: 'car-form',
//     constraint: getZodConstraint(CarSchema),
//     lastResult: actionData?.result,
//     defaultValue: {
//       redirectUrl: '/',
//     },
//     onValidate({ formData }) {
//       return parseWithZod(formData, { schema: CarSchema })
//     },
//   })

//   return (
//     <div className="absolute left-0 top-0 z-10 flex h-dvh w-screen items-center justify-center bg-slate-950 bg-opacity-50">
//       <div className="w-[25vw] rounded-lg bg-white p-4">
//         <h1 className="text-18 font-semibold">Enter your car details</h1>
//         <p className="slate-600 text-14">
//           With your car details we can give you better answers
//         </p>

//         <Form
//           className="space-y-4"
//           method="post"
//           action="/update-car"
//           {...getFormProps(form)}
//         >
//           <AuthenticityTokenInput />

//           <div className="grid w-full items-center gap-1.5">
//             <Label htmlFor={fields.carBrand.id}>Car brand</Label>
//             <Field
//               placeholder="BMW, Volkswagen, Audi"
//               {...getInputProps(fields.carBrand, {
//                 type: 'text',
//                 value: false,
//               })}
//               defaultValue={userCar?.carBrand}
//             />
//             <ErrorList
//               id={fields.carBrand.id}
//               errors={fields.carBrand.errors}
//             />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label htmlFor={fields.carModel.id}>Car model</Label>
//             <Field
//               placeholder="M5, Golf 4, S4"
//               {...getInputProps(fields.carModel, {
//                 type: 'text',
//                 value: false,
//               })}
//               defaultValue={userCar?.carModel}
//             />
//             <ErrorList
//               id={fields.carModel.id}
//               errors={fields.carModel.errors}
//             />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label htmlFor={fields.year.id}>Year</Label>
//             <Field
//               placeholder="2020"
//               {...getInputProps(fields.year, { type: 'text', value: false })}
//               defaultValue={userCar?.year}
//             />
//             <ErrorList id={fields.year.id} errors={fields.year.errors} />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label>Fuel</Label>
//             <Field
//               placeholder="2020"
//               className="hidden"
//               {...getInputProps(fields.fuel, { type: 'text', value: false })}
//               defaultValue={fuel}
//             />
//             <Combobox
//               data={fuelData}
//               title="Select fuel..."
//               value={fuel}
//               setValue={setFuel}
//             />
//             <ErrorList id={fields.fuel.id} errors={fields.fuel.errors} />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label htmlFor={fields.engineSize.id}>Engine size</Label>
//             <Field
//               placeholder="2000cc"
//               {...getInputProps(fields.engineSize, {
//                 type: 'text',
//                 value: false,
//               })}
//               defaultValue={userCar?.engineSize}
//             />
//             <ErrorList
//               id={fields.engineSize.id}
//               errors={fields.engineSize.errors}
//             />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label htmlFor={fields.power.id}>Power</Label>
//             <Field
//               placeholder="288kW"
//               {...getInputProps(fields.power, { type: 'text', value: false })}
//               defaultValue={userCar?.power}
//             />
//             <ErrorList id={fields.power.id} errors={fields.power.errors} />
//           </div>

//           <div className="grid w-full items-center gap-1.5">
//             <Label>Shifter</Label>
//             <Field
//               placeholder="2020"
//               className="hidden"
//               {...getInputProps(fields.shifter, { type: 'text', value: false })}
//               defaultValue={shifter}
//             />
//             <Combobox
//               data={shifterData}
//               title="Select shifter..."
//               value={shifter}
//               setValue={setShifter}
//             />
//             <ErrorList id={fields.shifter.id} errors={fields.shifter.errors} />
//           </div>

//           <Field {...getInputProps(fields.redirectUrl, { type: 'hidden' })} />

//           <StatusButton pendingText="Saving..." isPending={isSubmitting}>
//             Save
//           </StatusButton>
//         </Form>
//       </div>
//     </div>
//   )
// }

// export default CarModal
