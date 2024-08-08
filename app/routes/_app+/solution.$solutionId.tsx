import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { GeneralErrorBoundary } from '~/components/error-boundary'
import { prisma } from '~/utils/db.server'
import { invariantResponse } from '~/utils/misc'
import Markdown from 'react-markdown'
import Logo from '~/assets/Logo.svg'

export async function loader({ params }: LoaderFunctionArgs) {
  const { solutionId } = params

  console.log(solutionId)

  const solution = await prisma.solution.findUnique({
    where: {
      id: solutionId,
    },
    select: {
      solution: true,
    },
  })

  invariantResponse(solution, 'Solution not found', { status: 404 })

  return json({ solution })
}

const Solution = () => {
  const { solution } = useLoaderData<typeof loader>()

  return (
    <div className="max-w-[860px] mx-auto flex mt-11 lg:gap-10 gap-4">
      <div className="w-8 h-8 lg:w-12 lg:h-12 rounded-full bg-slate-600 flex-shrink-0">
        <img src={Logo} alt="" />
      </div>

      <div className="markdown">
        <Markdown>{solution.solution}</Markdown>
      </div>
    </div>
  )
}
export default Solution

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
