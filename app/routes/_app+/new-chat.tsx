// External Libraries
import { z } from 'zod'
import OpenAI from 'openai'

// Remix Utilities
import {
  ActionFunctionArgs,
  json,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'

// Conform Utilities
import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'

// Components
import Button from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import GradientHeading from '~/components/GradientHeading'
import { GeneralErrorBoundary } from '~/components/error-boundary'

// Server Utilities
import { requireUser } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import { prisma } from '~/utils/db.server'
import { invariantResponse, useIsPending } from '~/utils/misc'
import { DiagnosticCategory, isValidCategory } from '~/lib/categories'

const ProblemSchema = z.object({
  problem: z.string().min(100),
  diagnostics: z.string(),
  light: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, {
    schema: (intent) =>
      ProblemSchema.transform(async (data, ctx) => {
        if (intent !== null) return { ...data }

        if (user.subscription?.status !== 'ACTIVE') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'To continue, please subscribe to unlock full access.',
          })

          return z.NEVER
        }

        return { ...data }
      }),
    async: true,
  })

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      { status: submission.status === 'error' ? 400 : 200 },
    )
  }

  const car = await prisma.car.findFirst({
    where: {
      userId: user.id,
      defaultCar: true,
    },
    select: {
      id: true,
      carBrand: true,
      carModel: true,
      engineSize: true,
      fuel: true,
      power: true,
      shifter: true,
      year: true,
    },
  })

  invariantResponse(car, 'You must set a default car', { status: 400 })

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  })

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `You are a certified automotive technician who explains car issues to everyday drivers in a clear, friendly, and helpful way. Your job is to analyze a car's problem description, diagnostics (if any), and dashboard lights, and then give a structured breakdown of what might be wrong.

                  IMPORTANT:
                  - Only respond to car-related issues.
                  - If the user asks something unrelated, reply: "Sorry, I can only help with car and vehicle-related issues. Please describe a car problem and include your vehicle details."

                  At the top of your response, always include a short, descriptive **Markdown H1 title** (starting with "#") summarizing the main issue. Example:
                  # Knocking Sound from Front Right Wheel

                  Then follow this exact format using clean Markdown:

                  ---

                  ## 🔊 Problem Summary  
                  Briefly summarize what the issue likely is, using plain English. Keep it clear and confident.

                  ---

                  ## 🔍 Possible Causes  
                  List 3-5 likely causes. For each, use this format:

                  ### 🛠️ [Component Name]  
                  - **Symptoms:**  
                  - **What to Check:**  
                  - **DIY-Friendly?** Yes/No (include short explanation)  
                  - **💵 Estimated Cost:** $XX-$XXX

                  ---

                  ## 🧑‍🔧 When to Visit a Mechanic  
                  Explain when it becomes risky or costly to wait. Be helpful, not alarmist.

                  ---

                  ## 💡 Helpful Tip
                  Include one tip that relates to the issue, maintenance advice, or peace of mind — tailored to the user's car type if possible.

                  ---

                  At the end of your response, include the category of the issue using ONLY one of the following categories:

                  SUSPENSION  
                  ENGINE  
                  BRAKES  
                  TRANSMISSION  
                  STEERING  
                  BATTERY  
                  FUEL_SYSTEM  
                  COOLING  
                  ELECTRICAL  
                  EXHAUST  
                  TIRES  
                  SENSORS  
                  UNKNOWN

                  Format it on a new line like this:
                  [Category: SUSPENSION]

                  Writing rules:
                  - Use **bold** for key terms and cost labels.
                  - Use bullet points inside each section where appropriate.
                  - Avoid technical jargon unless it's explained.
                  - Never reference luxury vehicles unless the user owns one.
                  - Format cleanly in Markdown for web rendering.

                  Be empathetic, clear, and helpful. Your tone should feel like a knowledgeable mechanic giving real-world advice to someone who might be confused or stressed about their car.
                  Avoid being overly technical or using jargon that a non-mechanic might not understand. Your goal is to help the user understand their car problem and what they can do about it.`,
      },
      {
        role: 'user',
        content: `
          My problem described in as much detail as possible:
          ${submission.value.problem}

          Diagnostics said this:
          ${submission.value.diagnostics}

          Lights on dashboard:
          ${submission.value.light}

          This is my car:

          Car brand: ${car.carBrand}  
          Model: ${car.carModel}  
          Year: ${car.year}  
          Engine size: ${car.engineSize}  
          Power: ${car.power}  
          Fuel: ${car.fuel}  
          Shifter: ${car.shifter}

        `,
      },
    ],
    model: 'gpt-4o',
  })

  const message = completion.choices[0].message.content

  invariantResponse(message, 'Something went wrong. Try later.', {
    status: 500,
  })

  const categoryMatch = message.match(/\[Category:\s([A-Z_]+)\]/)
  const displayOutput = message.replace(/\[Category:\s([A-Z_]+)\]/, '').trim()

  let category = (categoryMatch?.[1].toUpperCase() ??
    'UNKNOWN') as DiagnosticCategory

  if (!isValidCategory(category)) {
    category = 'UNKNOWN'
  }

  const titleMatch = message.trim().match(/^#\s+(.*)/)

  const solution = await prisma.solution.create({
    data: {
      solutionTitle: titleMatch ? titleMatch[1] : 'No title found',
      solution: displayOutput,
      problem: submission.value.problem,
      diagnostic: submission.value.diagnostics,
      dashboardLights: submission.value.light,
      category: category,
      user: {
        connect: {
          id: user.id,
        },
      },
      car: {
        connect: {
          id: car.id,
        },
      },
    },
    select: {
      id: true,
    },
  })

  return redirect(`/solution/${solution.id}`)
}

const NewChat = () => {
  const actionData = useActionData<typeof action>()
  const isPending = useIsPending()

  const [form, fields] = useForm({
    id: 'problem-form',
    constraint: getZodConstraint(ProblemSchema),
    lastResult: actionData?.result,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ProblemSchema })
    },
  })

  return (
    <>
      <div className="mt-30 flex w-full flex-col items-center justify-center md:mt-120">
        <GradientHeading className="mb-50 text-5xl md:text-[4rem]">
          Diagnose your car problem
        </GradientHeading>

        <Form className="w-full" method="post" {...getFormProps(form)}>
          <AuthenticityTokenInput />

          <div className="mx-auto flex w-full max-w-2xl flex-col gap-20">
            <div className="flex flex-col">
              <label
                htmlFor={fields.problem.id}
                className="mb-10 text-16 md:text-18"
              >
                Describe your car problem:
              </label>
              <textarea
                {...getTextareaProps(fields.problem)}
                className="rounded-7 border border-white/15 bg-black p-10"
                placeholder="What's happening with your car? Describe the sounds, behavior, or anything unusual you've noticed."
                rows={3}
              />
              <ErrorList
                id={fields.problem.id}
                errors={fields.problem.errors}
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor={fields.diagnostics.id}
                className="mb-10 text-16 md:text-18"
              >
                Did you attach it to diagnostics? What does it say?
              </label>
              <textarea
                {...getTextareaProps(fields.diagnostics)}
                className="rounded-7 border border-white/15 bg-black p-10"
                placeholder="If you scanned it, include any fault codes (e.g. P0420). If not, just write “No codes.”"
                rows={3}
              />
              <ErrorList
                id={fields.diagnostics.id}
                errors={fields.diagnostics.errors}
              />
            </div>

            <div className="mb-40 flex flex-col">
              <label
                htmlFor={fields.light.id}
                className="mb-10 text-16 md:text-18"
              >
                Is there any light lit on the dashboard?
              </label>
              <textarea
                {...getTextareaProps(fields.light)}
                className="rounded-7 border border-white/15 bg-black p-10"
                placeholder="List any lights you see. If you don't know what they are, describe the symbol or color."
                rows={3}
              />
              <ErrorList id={fields.light.id} errors={fields.light.errors} />
            </div>

            <ErrorList id={form.id} errors={form.errors} />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Generating asnwer....' : 'Diagnose'}
            </Button>
          </div>
        </Form>
      </div>
    </>
  )
}
export default NewChat

export const meta: MetaFunction = () => {
  return [
    { title: 'New Problem | MechanicAI' },
    {
      property: 'og:tittle',
      content: 'New Problem | MechanicAI',
    },
    {
      property: 'og:description',
      content:
        'Answer three simple questions on MechanicAI to diagnose your car problem. Get possible causes and solutions for your car issues.',
    },
    {
      name: 'description',
      content:
        'Answer three simple questions on MechanicAI to diagnose your car problem. Get possible causes and solutions for your car issues.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI ,car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
