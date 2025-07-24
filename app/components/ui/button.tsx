import type { FC, ReactNode } from 'react'

interface ButtonProps {
  onClick?: () => void
  children: ReactNode
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'destructive' | 'outline'
}

const Button: FC<
  ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({
  onClick,
  children,
  className,
  disabled = false,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`box-border flex cursor-pointer items-center justify-center rounded-7 p-2 py-10 text-18 font-medium text-white transition duration-200 disabled:bg-blue-950 disabled:text-blue-500 ${
        variant === 'primary' && 'bg-blue-700 hover:bg-blue-600'
      } ${variant === 'destructive' && 'bg-red-600 hover:bg-red-500'} ${
        variant === 'outline' && 'border border-white hover:bg-white/10'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
