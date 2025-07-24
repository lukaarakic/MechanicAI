// Components
import GradientHeading from '~/components/GradientHeading'
import HistoryList from '~/components/history/history-list'

// Remix
import { ActionFunctionArgs, MetaFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

// Utils
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
          defaultCar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return solutions.map((solution) => ({
    ...solution,
    category: solution.category || 'Uncategorized',
    createdAt: solution.createdAt.toISOString(),
  }))
}

const History = () => {
  const solutions = useLoaderData<typeof loader>()

  return (
    <div className="mt-50 flex flex-col items-center justify-center gap-20 lg:px-70">
      <GradientHeading
        size="lg"
        className="!mx-0 mb-40 text-5xl md:text-[4rem]"
      >
        Your Troubleshoot History
      </GradientHeading>

      <HistoryList solutions={solutions} variant="big" />
    </div>
  )
}

export const meta: MetaFunction = () => {
  return [
    { title: 'Troubleshoot History | MechanicAI' },
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

export default History
