import { Link, Outlet, useLocation } from '@remix-run/react'
import Button from '~/components/ui/button'
import Separator from '~/components/ui/separator'

const CarLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="w-full">
      <div className="flex w-full flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-20 md:mb-0">
          <p className="text-18 font-bold">Manage Your Cars</p>
          <p>Add, edit, or select your default car.</p>
        </div>

        {pathname === '/settings/car' && (
          <Button>
            <Link to="/settings/car/add" className="px-10 text-16">
              Add your car
            </Link>
          </Button>
        )}
      </div>

      <Separator />

      <Outlet />
    </div>
  )
}

export default CarLayout
