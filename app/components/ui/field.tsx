import { ChangeEvent, FC, InputHTMLAttributes } from 'react'

interface FieldProps {
  label?: string
  type: string
  name: string
  value?: string
  placeholder?: string
  className?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

const Field: FC<FieldProps & InputHTMLAttributes<HTMLInputElement>> = ({
  label,
  type,
  name,
  value,
  placeholder,
  className = '',
  onChange,
  ...props
}) => {
  return (
    <div className="flex w-full flex-col">
      {label ? (
        <label htmlFor={name} className="mb-10 text-16 font-medium">
          {label}
        </label>
      ) : null}
      <input
        className={`rounded-7 border border-white/15 bg-black px-4 py-3 text-16 disabled:text-white/70 ${className}`}
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
    </div>
  )
}

export default Field
