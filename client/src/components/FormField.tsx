import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'
import { REQUIRED_MSG, fieldClass } from '../utils/validation'

export function FieldError({ show }: { show: boolean }) {
  if (!show) return null
  return <p className="mt-1 text-xs font-medium text-red-600">{REQUIRED_MSG}</p>
}

export function FormLabel({
  children,
  required,
}: {
  children: ReactNode
  required?: boolean
}) {
  return (
    <label className="text-sm font-medium text-gray-700">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </label>
  )
}

export function FormInput({
  error,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <>
      <input className={fieldClass(!!error, className)} {...props} />
      <FieldError show={!!error} />
    </>
  )
}

export function FormSelect({
  error,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  error?: boolean
  children: ReactNode
}) {
  return (
    <>
      <select className={fieldClass(!!error, className)} {...props}>
        {children}
      </select>
      <FieldError show={!!error} />
    </>
  )
}
