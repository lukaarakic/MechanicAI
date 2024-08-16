import { Button } from './button'
import { FC, ReactNode } from 'react'

interface PendingButtonProps {
  children: ReactNode
  pendingText: string
  isPending: boolean
}

const StatusButton: FC<PendingButtonProps> = ({
  children,
  pendingText,
  isPending,
}) => {
  return (
    <Button disabled={isPending}>{isPending ? pendingText : children}</Button>
  )
}

export default StatusButton
