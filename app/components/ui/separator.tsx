import { cn } from '~/lib/utils'

const Separator = ({ className }: { className?: string }) => {
  return <div className={cn('my-25 h-px w-full bg-white/25', className)} />
}

export default Separator
