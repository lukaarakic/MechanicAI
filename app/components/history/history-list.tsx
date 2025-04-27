import { cn } from '~/lib/utils'
import HistoryCard from './history-card'
import { FC } from 'react'

interface HistoryListProps {
  solutions: {
    id: string
    createdAt: string
    solutionTitle: string
    category: string | null
    car: {
      carBrand: string
      carModel: string
      year: string
      fuel: string
      engineSize: string
      power: string
      shifter: string
    } | null
  }[]
  variant?: 'big' | 'small'
}

const HistoryList: FC<HistoryListProps> = ({ solutions }) => {
  return (
    <div
      className={cn(
        'grid max-w-screen-2xl grid-cols-1 justify-stretch gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3',
      )}
    >
      {solutions.map((solution) => (
        <HistoryCard
          car={solution.car}
          id={solution.id}
          key={solution.id}
          title={solution.solutionTitle}
          time={solution.createdAt}
          category={solution.category}
        />
      ))}
    </div>
  )
}

export default HistoryList
