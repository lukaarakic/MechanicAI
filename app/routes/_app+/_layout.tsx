// Remix imports
import { Outlet, useLoaderData } from '@remix-run/react'
import { LoaderFunctionArgs } from '@remix-run/node'

// Utils
import { requireUser } from '~/utils/auth.server'
import { prisma } from '~/utils/db.server'

// Components
import Navbar from '~/components/Navbar'
import OnboardingModal from '~/components/OnboardingModal'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  const cars = await prisma.car.findMany({
    where: {
      userId: user.id,
    },
  })

  return { user, cars }
}

const Layout = () => {
  const { user, cars } = useLoaderData<typeof loader>()

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] gap-10 pb-100 md:min-h-dvh md:pb-0">
      <Navbar user={user} />

      {cars.length === 0 && <OnboardingModal />}

      <main className="h-full w-full p-20 md:ml-80 lg:p-0">
        <Outlet />
      </main>
    </div>
  )
}
export default Layout
