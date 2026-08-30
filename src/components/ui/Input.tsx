import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm',
            'placeholder:text-gray-400',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        {hint && !error ? <p className="text-xs text-gray-500">{hint}</p> : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
