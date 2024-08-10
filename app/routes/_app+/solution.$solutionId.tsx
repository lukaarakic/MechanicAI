import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { prisma } from '~/utils/db.server'
import { invariantResponse } from '~/utils/misc'
import Markdown from 'react-markdown'
import Logo from '~/assets/Logo.svg'

export async function loader({ params }: LoaderFunctionArgs) {
  const { solutionId } = params

  const solution = await prisma.solution.findUnique({
    where: {
      id: solutionId,
    },
    select: {
      solution: true,
      solutionTitle: true,
    },
  })

  invariantResponse(solution, 'Solution not found', { status: 404 })

  return json({ solution })
}

const Solution = () => {
  const { solution } = useLoaderData<typeof loader>()

  return (
    <div className="mx-auto mt-11 flex max-w-[860px] gap-4 lg:gap-10">
      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-600 lg:h-12 lg:w-12">
        <img src={Logo} alt="" />
      </div>

      <div className="markdown">
        <Markdown>{solution.solution}</Markdown>
      </div>
    </div>
  )
}
export default Solution

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const solutionTitle = data?.solution.solutionTitle ?? 'Solution'
  const solution = data?.solution.solution.slice(0, 125) ?? 'No solution found'

  return [
    { title: `${solutionTitle} | MechanicAI` },
    {
      property: 'og:tittle',
      content: `${solutionTitle} | MechanicAI`,
    },
    {
      property: 'og:description',
      content: solution,
    },
    {
      name: 'description',
      content: solution,
    },
    {
      name: 'keywords',
      content:
        'MechanicAI ,car diagnosis, car problems, car repair, automotive troubleshooting',
    },
  ]
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: ({ params }) => {
          return <p>No solution by ID ({params.solutionId}) was found</p>
        },
      }}
    />
  )
}
