import { FC, useState } from 'react'
import CarIcon from '~/assets/icons/car-icon.svg?react'
import { differenceInDays, format, isToday, isYesterday } from 'date-fns'
import { Link } from '@remix-run/react'
import {
  categoryLabels,
  categoryStyles,
  DiagnosticCategory,
} from '~/lib/categories'
import { cn } from '~/lib/utils'

interface HistoryCardProps {
  title: string
  time: string
  id: string
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
}

function getRelativeDateLabel(date: string): string {
  if (isToday(date)) return format(date, 'h:mm a')
  if (isYesterday(date)) return 'Yesterday'

  const daysAgo = differenceInDays(new Date(), date)

  if (daysAgo <= 7) return 'Last 7 days'
  if (daysAgo <= 30) return 'Last 30 days'

  return 'Older'
}

const HistoryCard: FC<HistoryCardProps> = ({
  title,
  time,
  id,
  category,
  car,
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  return (
    <Link
      to={`/solution/${id}`}
      className="card relative flex w-full flex-col gap-64 rounded-7 border border-white/15 px-20 py-10 transition-colors hover:bg-white/5"
    >
      <h2 className="mb-auto font-medium">{title}</h2>

      <div className="flex items-center justify-between gap-20">
        <div className="flex items-center gap-1">
          <CarIcon
            className="w-25 fill-white"
            onMouseEnter={() => setIsPopoverOpen(true)}
            onMouseLeave={() => setIsPopoverOpen(false)}
            aria-label="Toggle Popover"
          />
          <div>
            <div
              className={cn(
                'fixed -mt-10 min-w-64 rounded-7 border border-white/25 bg-light-gray p-15 transition-all',
                isPopoverOpen
                  ? 'pointer-events-auto visible opacity-100'
                  : 'pointer-events-none invisible opacity-0',
              )}
            >
              <div className="flex flex-col gap-5">
                {car !== null ? (
                  <>
                    <p className="text-14">
                      Brand:{' '}
                      <span className="text-white/50">{car?.carBrand}</span>
                    </p>
                    <p className="text-14">
                      Model:{' '}
                      <span className="text-white/50">{car?.carModel}</span>
                    </p>
                    <p className="text-14">
                      Year: <span className="text-white/50">{car?.year}</span>
                    </p>
                    <p className="text-14">
                      Fuel Type:{' '}
                      <span className="text-white/50">{car?.fuel}</span>
                    </p>
                    <p className="text-14">
                      Engine Size:{' '}
                      <span className="text-white/50">{car?.engineSize}cc</span>
                    </p>
                    <p className="text-14">
                      Power:{' '}
                      <span className="text-white/50">{car?.power}kW</span>
                    </p>
                    <p className="text-14">
                      Transmission:{' '}
                      <span className="text-white/50">{car?.shifter}</span>
                    </p>
                  </>
                ) : (
                  <p>The car has beed deleted</p>
                )}
              </div>
            </div>
          </div>

          <p className="text-14 text-white/50">{getRelativeDateLabel(time)}</p>
        </div>

        <span
          className={cn(
            `rounded px-2 py-1 text-xs font-medium`,
            categoryStyles[category as DiagnosticCategory],
          )}
        >
          {categoryLabels[category as DiagnosticCategory]}
        </span>
      </div>
    </Link>
  )
}

export default HistoryCard
