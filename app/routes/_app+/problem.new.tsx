import { getFormProps, getTextareaProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { z } from 'zod'
import { Button } from '~/components/ui/button'
import ErrorList from '~/components/ui/ErrorList'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { requireUserId } from '~/utils/auth.server'
import { checkCSRF } from '~/utils/csrf.server'
import OpenAI from 'openai'
import { prisma } from '~/utils/db.server'
import { invariantResponse, useIsPending } from '~/utils/misc'

const ProblemSchema = z.object({
  problem: z.string().min(100),
  diagnostics: z.string(),
  light: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  await checkCSRF(formData, request)

  const submission = await parseWithZod(formData, { schema: ProblemSchema })

  if (submission.status !== 'success') {
    return json(
      {
        result: submission.reply(),
      },
      { status: submission.status === 'error' ? 400 : 200 }
    )
  }

  const car = await prisma.car.findUnique({
    where: {
      userId,
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
          You only can only answer to a mechanical questions. Answer in .md format only.
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

  await prisma.solution.create({
    data: {
      solutionTitle: titleMatch ? titleMatch[1] : 'No title found',
      solution: message,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })

  return json(
    {
      result: submission.reply(),
    },
    { status: 200 }
  )
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
      <div className="w-[50%] mx-auto mt-12">
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
          <div className="text-center -mt-3">
            <Button>Find solution</Button>
          </div>
        </Form>
      </div>

      {isPending ? (
        <div className="absolute top-0 left-0 h-dvh w-screen bg-slate-950 bg-opacity-50 flex items-center justify-center">
          <div className="p-4 bg-white rounded-lg max-w-96">
            Please allow me approximately 30 seconds to formulate my thoughts.
            Avoid exiting the application...{' '}
            <span className="animate-spin inline-block">🌀</span>
          </div>
        </div>
      ) : null}
    </>
  )
}
export default NewProblem
