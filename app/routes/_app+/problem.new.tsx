import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import {
  ActionFunctionArgs,
  json,
  MetaFunction,
  redirect,
} from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { requireUser } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import OpenAI from 'openai'
import { prisma } from '~/utils/db.server'
import { invariantResponse, useIsPending } from '~/utils/misc'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import Logo from '~/assets/Logo.svg'

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

        if (user.tokens < 10) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'You dont have enough tokens.',
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

  const car = await prisma.car.findUnique({
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

  invariantResponse(car, 'You must add car information first', { status: 400 })

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  })

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: `
          Need somebody with expertise on automobiles regarding troubleshooting solutions like;
          diagnosing problems/errors present both visually & within engine parts in order to figure out what's causing them (like lack of oil or power issues)
          & suggest required replacements while recording down details such fuel consumption type etc. I'll answer to 3 questions so you can analyze problem.
          You only can only answer to a mechanical questions. Answer in .md format only. In start answer dont use \`\`\`md or \`\`\`markdown, and similar.

          Here is an example answer: 

          # Front Right Wheel Noise

          ## Issue Summary
          You are experiencing a knocking or clunking noise from the front right wheel while driving, particularly when driving over bumps or imperfections in the road.

          ## Potential Causes

          1. **Worn Suspension Components**
            - **Ball Joints**: Check for wear or damage in the ball joints. A failed ball joint can cause a knocking noise when the vehicle goes over bumps.
            - **Control Arms**: Inspect the control arms and bushings. Worn bushings can lead to movement and noise.
            - **Struts/Shocks**: Old or damaged struts/shocks may not dampen bumps properly, causing noise and poor handling.

          2. **Loose or Damaged Hardware**
            - **Brake Components**: Loose calipers or missing hardware can produce noise. Ensure all components are properly secured.
            - **Wheel Hub Assembly**: Check if the wheel hub assembly is loose or damaged. A failing hub can create knocking sounds.

          3. **Tire Issues**
            - **Tire Condition**: Inspect the tread and sidewalls of the tire for bulges, uneven wear, or damage. Certain tire issues can cause noise when encountering road irregularities.
            - **Mounting**: Ensure that the tire is properly mounted and the lug nuts are adequately tightened.

          ## Recommended Actions

          1. **Visual Inspection**
            - Start by performing a visual inspection of the front suspension components. Look for any obvious signs of wear, damage, or looseness.

          2. **Test Drive**
            - If possible, do a controlled test drive to identify specific conditions under which the noise occurs (speed, turning, etc.).

          3. **Detailed Component Check**
            - If you can access tools, consider checking the ball joints, control arms, and struts for movement or damage by manually applying pressure or using a pry bar.

          4. **Consult a Professional**
            - If you are unable to identify the noise sources or are not comfortable inspecting these components, consult a qualified mechanic for a comprehensive inspection.

          ## Recording Details
          - **Fuel Consumption**: Note any changes in fuel consumption patterns, as suspension issues can sometimes impact fuel efficiency if aligned components are not functioning correctly.
          - **Other Symptoms**: Document any additional symptoms such as handling issues, vibrations, or change in ride quality to help with diagnosis.

          Make sure to address the issue promptly to avoid potential safety risks or further damage to the vehicle. Take your time to find out everything that can be issue. Also find common problems with car given to you, and see if thaht may be an issue.
          `,
      },
      {
        role: 'user',
        content: `
          My problem describem in as much details as possible: ${submission.value.problem}

          Diagonostics said this: ${submission.value.diagnostics}

          Lights on dashboard: ${submission.value.light}

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
    model: 'gpt-4o-mini',
  })

  const message = completion.choices[0].message.content

  invariantResponse(message, 'Something went wrong. Try later.', {
    status: 500,
  })

  const titleMatch = message.match(/^#\s+(.*)/)

  const solution = await prisma.solution.create({
    data: {
      solutionTitle: titleMatch ? titleMatch[1] : 'No title found',
      solution: message,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
    select: {
      id: true,
    },
  })

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      tokens: {
        decrement: 10,
      },
    },
  })

  return redirect(`/solution/${solution.id}`)
}

const NewProblem = () => {
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
      <div className="mx-auto mt-12 w-[95%] lg:w-[50%]">
        <Form className="space-y-12" method="post" {...getFormProps(form)}>
          <AuthenticityTokenInput />

          <div>
            <Label htmlFor={fields.problem.id}>
              Describe the problem in as much detail as possible
            </Label>
            <Textarea
              {...getTextareaProps(fields.problem)}
              placeholder="Here, describe in detail what problems are you facing. What you hear and see."
            />
            <ErrorList id={fields.problem.id} errors={fields.problem.errors} />
          </div>

          <div>
            <Label htmlFor={fields.diagnostics.id}>
              Did you attach it to diagnostics? What does it say?
            </Label>
            <Textarea
              {...getTextareaProps(fields.diagnostics)}
              placeholder="Type your fault codes here, if there are any."
            />
            <ErrorList
              id={fields.diagnostics.id}
              errors={fields.diagnostics.errors}
            />
          </div>

          <div>
            <Label htmlFor={fields.light.id}>
              Is there any light on the dashboard lit?
            </Label>
            <Textarea
              {...getTextareaProps(fields.light)}
              placeholder="If a light is on, write down which one it is; if you don't know the name, describe it."
            />
            <ErrorList id={fields.light.id} errors={fields.light.errors} />
          </div>

          <ErrorList id={form.id} errors={form.errors} />
          <div className="-mt-3 text-center">
            <Button>Find solution</Button>
          </div>
        </Form>
      </div>

      {isPending ? (
        <div className="absolute left-0 top-0 z-50 flex h-dvh w-screen flex-col items-center justify-center bg-slate-950 bg-opacity-50">
          <img src={Logo} alt="" className="animate-spin-slow w-[20vw]" />
          <p className="mt-1 text-24 text-white">Please wait...</p>
        </div>
      ) : null}
    </>
  )
}
export default NewProblem

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
