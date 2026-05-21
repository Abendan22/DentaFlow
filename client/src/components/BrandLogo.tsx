import teethLogo from '../assets/teethlogo.png'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const boxSizes = {
  sm: 'h-10 w-10 p-0.5',
  md: 'h-12 w-12 p-1',
  lg: 'h-20 w-20 p-1.5',
}

/** Logo on white pad so extra PNG background does not show through */
export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 ${boxSizes[size]} ${className}`}
    >
      <img src={teethLogo} alt="" className="h-full w-full object-contain" />
    </span>
  )
}
