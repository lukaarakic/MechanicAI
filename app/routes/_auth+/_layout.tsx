import { Outlet } from '@remix-run/react'
import TextAltLogo from '~/assets/TextAltLogo.svg'
import TextLogo from '~/assets/TextLogo.svg'

const Layout = () => {
  return (
    <div className="flex h-dvh bg-slate-900">
      <div className="hidden h-full p-9 lg:block lg:w-1/2">
        <img src={TextAltLogo} alt="" className="w-96" />
      </div>
      <div className="relative flex h-full w-full items-center justify-center bg-slate-50 lg:w-1/2">
        <img
          src={TextLogo}
          alt=""
          className="absolute bottom-4 w-full px-4 lg:hidden"
        />

        <div className="mx-auto p-4 md:w-[65%]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
export default Layout
