import { Solution } from '@prisma/client'
import { Link, NavLink } from '@remix-run/react'
import Button from '~/components/ui/button'
import { X } from 'lucide-react'

type SolutionSidebar = {
  id: Solution['id']
  solution: Solution['solution']
  solutionTitle: Solution['solutionTitle']
}

const SolutionsSidebar = ({
  solutions,
  open,
  setOpen,
}: {
  solutions: SolutionSidebar[]
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <div
      className={`absolute left-0 top-0 z-10 flex h-dvh w-full -translate-x-full flex-col border-r border-r-slate-300 bg-slate-50 p-8 transition-transform sm:w-[55%] md:w-[40%] lg:static lg:w-[30%] lg:translate-x-0 xl:w-[20%] ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <span className="mb-8 inline-block text-24 font-semibold leading-none text-slate-950">
        Previous solutions
      </span>

      <button
        className="absolute right-6 top-9 lg:hidden"
        onClick={() => setOpen(false)}
      >
        <X />
      </button>

      <div className="flex h-[85%] w-full flex-col gap-2 overflow-y-auto">
        {solutions
          ? solutions.map((solution) => (
              <NavLink
                onClick={() => setOpen(false)}
                to={`/solution/${solution.id}`}
                key={solution.id}
                className={({ isActive }) =>
                  isActive
                    ? 'w-full rounded-lg bg-slate-100 py-4 text-center'
                    : 'w-full rounded-lg bg-slate-50 py-4 text-center'
                }
              >
                {solution.solutionTitle.length > 30
                  ? `${solution.solutionTitle.slice(0, 25)}...`
                  : solution.solutionTitle}
              </NavLink>
            ))
          : 'No solutions found...'}
      </div>

      <Link to="/problem/new" className="mt-auto">
        <Button className="w-full">New Problem</Button>
      </Link>
    </div>
  )
}
export default SolutionsSidebar
