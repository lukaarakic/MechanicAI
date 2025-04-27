import { Link, Outlet, useLocation } from '@remix-run/react'

import WhiteLogo from '~/assets/logo-white.svg?react'

const AuthLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-20">
      <div className="flex w-full flex-col items-center rounded-12 p-20 lg:w-[35.125rem] lg:border lg:border-white/15 lg:p-40">
        <WhiteLogo className="mb-30 w-16" />

        <Outlet />
      </div>

      {pathname === '/signup' ? (
        <p>
          Already have an account?{' '}
          <Link to={'/login'} className="text-blue-700">
            Log in
          </Link>
        </p>
      ) : pathname === '/login' ? (
        <p>
          Don’t have an account yet?{' '}
          <Link to={'/signup'} className="text-blue-700">
            Sign up
          </Link>
        </p>
      ) : pathname === '/verify' ? (
        <Link to={'/signup'} className="text-blue-700">
          Go back to sign up
        </Link>
      ) : null}
    </div>
  )
}

export default AuthLayout
