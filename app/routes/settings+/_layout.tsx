import { json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, NavLink, Outlet } from '@remix-run/react'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { requireUserId } from '~/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request)

  return json({})
}

const Layout = () => {
  return (
    <main className="p-10 relative">
      <h1 className="text-24 font-semibold">Settings</h1>
      <p className="slate-600 text-14">Manage your account settings.</p>

      <Button variant={'ghost'} className="absolute right-10 top-10">
        <Link to={'/'}>Dashboard</Link>
      </Button>

      <Separator className="my-6" />

      <div className="flex gap-20">
        <div className="w-72 space-y-3">
          <NavLink
            to={'/settings/account'}
            className={({ isActive }) =>
              isActive
                ? 'bg-slate-200 text-14 font-medium py-2 w-full inline-block text-center rounded-lg'
                : 'bg-white text-14 font-medium py-2 w-full inline-block rounded-lg text-center transition-colors hover:bg-slate-100'
            }
          >
            Account
          </NavLink>
          <NavLink
            to={'/settings/tokens'}
            className={({ isActive }) =>
              isActive
                ? 'bg-slate-200 text-14 font-medium py-2 w-full inline-block text-center rounded-lg'
                : 'bg-white text-14 font-medium py-2 w-full inline-block rounded-lg text-center transition-colors hover:bg-slate-100'
            }
          >
            Tokens
          </NavLink>
          <NavLink
            to={'/settings/car'}
            className={({ isActive }) =>
              isActive
                ? 'bg-slate-200 text-14 font-medium py-2 w-full inline-block text-center rounded-lg'
                : 'bg-white text-14 font-medium py-2 w-full inline-block rounded-lg text-center transition-colors hover:bg-slate-100'
            }
          >
            Car
          </NavLink>
        </div>
        <div className="w-1/2">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
export default Layout
