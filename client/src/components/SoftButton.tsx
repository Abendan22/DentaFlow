import type { ButtonHTMLAttributes, ReactNode } from 'react'

const variants = {
  primary:
    'bg-blue-500/90 text-white shadow-sm hover:bg-blue-500 hover:shadow-md active:scale-[0.98]',
  success:
    'bg-emerald-500/90 text-white shadow-sm hover:bg-emerald-500 hover:shadow-md active:scale-[0.98]',
  danger:
    'bg-rose-400/90 text-white shadow-sm hover:bg-rose-500 hover:shadow-md active:scale-[0.98]',
  ghost:
    'bg-slate-100 text-slate-700 shadow-sm hover:bg-slate-200 active:scale-[0.98]',
  outline:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]',
}

type Variant = keyof typeof variants

export function SoftButton({
  variant = 'primary',
  className = '',
  type,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}) {
  return (
    <button
      type={type ?? 'button'}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
