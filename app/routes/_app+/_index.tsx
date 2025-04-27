import type { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'

// Components
import Button from '~/components/ui/button'
import HistoryList from '~/components/history/history-list'

// Utilities
import { requireUser } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

export const loader = async ({ request }: ActionFunctionArgs) => {
  const user = await requireUser(request)

  const solutions = await prisma.solution.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      createdAt: true,
      solutionTitle: true,
      category: true,
      car: {
        select: {
          carBrand: true,
          carModel: true,
          engineSize: true,
          fuel: true,
          power: true,
          year: true,
          shifter: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 3,
  })

  return { user, solutions }
}

export default function Index() {
  const {
    user: { firstName },
    solutions,
  } = useLoaderData<typeof loader>()

  return (
    <div className="mt-30 flex h-full w-full flex-col items-center justify-center md:mt-[15vh] lg:mt-[20vh]">
      <h1 className="by-the-sea mx-auto mb-25 w-fit text-5xl font-semibold leading-tight md:text-[4rem]">
        Hi there, {firstName}
        <br />
        What would you like to do?
      </h1>

      <div className="mb-40 w-full md:w-auto">
        {solutions.length > 0 && (
          <>
            <p className="mb-10 w-full text-left">Your History</p>

            <HistoryList solutions={solutions} />
          </>
        )}
      </div>

      <Link to={'/new-chat'} className="w-full">
        <Button className="mx-auto w-full max-w-xl">Create new chat</Button>
      </Link>
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [
    { title: 'MechanicAI' },
    {
      name: 'description',
      content:
        'Welcome to MechanicAI - the smart way to diagnose car problems. Get quick, accurate insights into your car issues by answering a few questions.',
    },
    {
      name: 'keywords',
      content:
        'MechanicAI, car diagnosis, car problems, automotive troubleshooting, car repair, car issues, car maintenance',
    },
  ]
}
