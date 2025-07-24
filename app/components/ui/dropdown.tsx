/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ChevronDown } from 'lucide-react'
import { cn } from '~/lib/utils'
import Field from './field'
import { FC, useState } from 'react'

interface DropdownProps {
  suggestions: string[]
  placeholder: string
  defaultValue?: string
  name: string
  label?: string
  setValue?: React.Dispatch<React.SetStateAction<string>>
}

const Dropdown: FC<DropdownProps> = ({
  name,
  placeholder,
  suggestions,
  defaultValue,
  label,
  setValue,
}) => {
  const [isFocus, setIsFocus] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [inputValue, setInputValue] = useState(defaultValue || '')

  return (
    <div className="relative isolate z-10">
      <Field
        label={label}
        placeholder={placeholder}
        onFocus={() => setIsFocus(true)}
        onBlur={() => {
          if (!isHovered) {
            setIsFocus(false)
          }
        }}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setValue?.(e.target.value)
        }}
        type={'text'}
        name={name}
      />
      <ChevronDown
        className={cn(
          'text-gray absolute right-10 top-1/2 translate-y-[25%] transition-transform',
          isFocus && 'rotate-180',
        )}
      />
      <div
        className={cn(
          'scrollbar absolute z-50 max-h-[30dvh] w-full rounded-7 border border-white/15 bg-black shadow-small transition-all duration-200 ease-in-out',
          isFocus
            ? 'pointer-events-auto visible opacity-100'
            : 'pointer-events-none invisible opacity-0',
        )}
        onMouseEnter={() => {
          setIsHovered(true)
        }}
        onMouseLeave={() => {
          setIsHovered(false)
        }}
      >
        {(() => {
          const filtered = suggestions.filter((s) =>
            s.toLowerCase().includes(inputValue.toLowerCase()),
          )

          const displaySuggestions =
            filtered.length > 0
              ? filtered
              : [suggestions[suggestions.length - 1]]

          return displaySuggestions.map((suggestion, index) => (
            <div key={index} className="w-full">
              <div
                className="w-full cursor-pointer p-10 text-left hover:bg-light-gray"
                onMouseDown={() => {
                  setInputValue(suggestion)
                  setValue?.(suggestion)
                  setIsFocus(false)
                }}
                // onTouchEnd={() => {
                //   setInputValue(suggestion)
                //   setValue?.(suggestion)
                //   setIsFocus(false)
                // }}
              >
                {suggestion}
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}

export default Dropdown
