import { Outlet } from '@remix-run/react'

const Layout = () => {
  return (
    <div className="bg-slate-900 h-dvh flex">
      <div className="w-1/2 h-full"></div>
      <div className="w-1/2 bg-slate-50 h-full flex items-center justify-center relative">
        <div className="w-[65%] mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
export default Layout
