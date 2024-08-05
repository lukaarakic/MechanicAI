import { Solution } from '@prisma/client'
import { NavLink } from '@remix-run/react'

type SolutionSidebar = {
  id: Solution['id']
  solution: Solution['solution']
  solutionTitle: Solution['solutionTitle']
}

const SolutionsSidebar = ({ solutions }: { solutions: SolutionSidebar[] }) => {
  return (
    <div className="w-[20%] border-r border-r-slate-300 p-8">
      <span className="text-24 font-semibold text-slate-950 mb-8 inline-block">
        Previous solutions
      </span>

      <div className="flex flex-col w-full">
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
    </div>
  )
}
export default SolutionsSidebar
