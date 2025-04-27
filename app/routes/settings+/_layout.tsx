// Remix imports
import { LoaderFunctionArgs } from '@remix-run/node'
import { NavLink, Outlet, useLoaderData } from '@remix-run/react'

// Components
import GradientHeading from '~/components/GradientHeading'
import Navbar from '~/components/Navbar'
import Separator from '~/components/ui/separator'

// Utilities
import { requireUser } from '~/utils/auth.server'

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request)

  return user
}

// className="h-full w-full pl-[8.125rem] pr-70 pt-50"

const Layout = () => {
  const user = useLoaderData<typeof loader>()

  return (
    <>
      <div className="flex min-h-[calc(100dvh-5rem)] gap-10 pb-100 md:min-h-dvh md:pb-0">
        <Navbar
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          avatar={user.avatar}
        />

        <main className="h-full w-full p-20 pt-50 md:ml-80 md:pl-[8.125rem] md:pr-70">
          <GradientHeading size="sm" className="!mx-0 mb-5">
            Settings
          </GradientHeading>
          <p>Manage your account settings</p>
          <Separator />
          <div className="gap-70 md:flex">
            <div className="mb-40 grid grid-cols-2 gap-10 md:flex md:flex-col">
              <NavLink
                to="/settings/account"
                className={({ isActive }) =>
                  `rounded-7 border border-white/10 px-50 py-10 text-center ${
                    isActive ? 'text-blue-700' : 'text-white'
                  }`
                }
              >
                Account
              </NavLink>

              <NavLink
                to="/settings/car"
                className={({ isActive }) =>
                  `rounded-7 border border-white/10 px-50 py-10 text-center ${
                    isActive ? 'text-blue-700' : 'text-white'
                  }`
                }
              >
                Car
              </NavLink>

              <NavLink
                to="/settings/tokens"
                className={({ isActive }) =>
                  `col-span-full rounded-7 border border-white/10 px-50 py-10 text-center ${
                    isActive ? 'text-blue-700' : 'text-white'
                  }`
                }
              >
                Tokens
              </NavLink>
            </div>

            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
export default Layout
