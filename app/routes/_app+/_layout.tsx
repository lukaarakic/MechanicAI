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
import { useState } from 'react'
import { Menu } from 'lucide-react'

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

  return json({ user, solutions })
}

const Layout = () => {
  const { user, solutions } = useLoaderData<typeof loader>()
  const [open, setOpen] = useState(false)

  return (
    <main className="flex h-[85dvh] lg:h-[90dvh] bg-slate-50 relative">
      <SolutionsSidebar solutions={solutions} open={open} setOpen={setOpen} />

      <div className="w-full px-8 pt-4">
        <div className="flex items-center justify-between w-full">
          <button onClick={() => setOpen(true)} className="lg:hidden">
            <Menu />
          </button>
          <div className="hidden lg:block"></div>

          <Popover>
            <PopoverTrigger>
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img src={user.avatar} alt={`${user.firstName}'s avatar`} />
              </div>
            </PopoverTrigger>
            <PopoverContent>
              <div className="mb-2">
                <span className="text-16 font-medium block leading-3">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-slate-400 text-14 font-light">
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

        <div className="overflow-y-auto h-full lg:pb-28">
          <Outlet />
        </div>

        <p className="text-center text-slate-400 font-medium text-14">
          MechanicAI.app can make mistakes. Check important info
        </p>
      </div>
    </main>
  )
}
export default Layout
