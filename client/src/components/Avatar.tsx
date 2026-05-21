import { useState } from 'react'
import { withCacheBust } from '../utils/photoUrl'

export function Avatar({
  initials,
  photoUrl,
}: {
  initials: string
  photoUrl?: string | null
}) {
  const [broken, setBroken] = useState(false)
  const src = photoUrl && !broken ? withCacheBust(photoUrl) : null

  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        onError={() => setBroken(true)}
        className="h-10 w-10 rounded-full object-cover ring-2 ring-blue-100"
      />
    )
  }

  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
      {initials}
    </span>
  )
}
