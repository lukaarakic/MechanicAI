import SolutionsSidebar from '~/components/SolutionsSidebar'
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Button } from '~/components/ui/button'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { requireUser } from '~/utils/auth.server'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { prisma } from '~/utils/db.server'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import TextLogo from '~/assets/TextLogo.svg'
import CarModal from '~/components/car-model'
import { carStorage } from '~/utils/car.server'
import { useToast } from '~/components/ui/use-toast'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  const solutions = await prisma.solution.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      solution: true,
      solutionTitle: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const car = await prisma.car.findFirst({
    where: {
      userId: user.id,
    },
  })

  const carSession = await carStorage.getSession(request.headers.get('cookie'))
  const status = carSession.get('status')

  return json({ user, solutions, car, status })
}

const Layout = () => {
  const {
    user,
    solutions,
    car,
    status: formStatus,
  } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (formStatus === 'success') {
      toast({
        title: 'Car details updated',
        description: 'Car details has been updated',
      })
    }
  }, [formStatus, toast])

  return (
    <main className="relative flex h-[85dvh] bg-slate-50 lg:h-[90dvh]">
      <SolutionsSidebar solutions={solutions} open={open} setOpen={setOpen} />

      {car ? null : <CarModal userCar={car} />}

      <div className="w-full px-8 pt-4">
        <div className="flex w-full items-center justify-between">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu />
          </button>
          <Link to={'/'} className="hidden lg:block">
            <img src={TextLogo} alt="" className="w-96" />
          </Link>

          <Popover>
            <PopoverTrigger>
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <img src={user.avatar} alt={`${user.firstName}'s avatar`} />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="mb-2">
                <span className="block text-16 font-medium leading-3">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-14 font-light text-slate-400">
                  {user.email}
                </span>
              </div>

              <div className="mb-2">Tokens: {user.tokens}</div>

              <div className="flex justify-between gap-2">
                <Button className="w-full">
                  <Link to={'/settings/account'}>Settings</Link>
                </Button>

                <Form method="post" action="/logout" className="w-full">
                  <AuthenticityTokenInput />
                  <Button className="w-full">Log out</Button>
                </Form>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="h-full overflow-y-auto lg:pb-28">
          <Outlet />
        </div>

        <p className="text-center text-14 font-medium text-slate-400">
          MechanicAI.app can make mistakes. Check important info
        </p>
      </div>
    </main>
  )
}
export default Layout
