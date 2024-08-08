import { Solution } from '@prisma/client'
import { NavLink } from '@remix-run/react'
import { Button } from './ui/button'

type SolutionSidebar = {
  id: Solution['id']
  solution: Solution['solution']
  solutionTitle: Solution['solutionTitle']
}

const SolutionsSidebar = ({ solutions }: { solutions: SolutionSidebar[] }) => {
  return (
    <div className="w-[20%] border-r border-r-slate-300 p-8 h-dvh flex flex-col">
      <span className="text-24 font-semibold text-slate-950 mb-8 inline-block">
        Previous solutions
      </span>

      <div className="flex flex-col gap-2 w-full overflow-y-auto h-[85%]">
        {solutions
          ? solutions.map((solution) => (
              <NavLink
                to={`/solution/${solution.id}`}
                key={solution.id}
                className={({ isActive }) =>
                  isActive
                    ? 'py-4 w-full bg-slate-100 rounded-lg text-center'
                    : 'py-4 w-full bg-slate-50 rounded-lg text-center'
                }
              >
                {solution.solutionTitle.length > 30
                  ? `${solution.solutionTitle.slice(0, 25)}...`
                  : solution.solutionTitle}
              </NavLink>
            ))
          : 'No solutions found...'}
      </div>

      <Button className="w-full mt-auto">New Problem</Button>
    </div>
  )
}
export default SolutionsSidebar
