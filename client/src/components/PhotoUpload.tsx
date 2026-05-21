import { useId, useRef, useState } from 'react'
import { SoftButton } from './SoftButton'
import { withCacheBust } from '../utils/photoUrl'

export function PhotoUpload({
  preview,
  serverUrl,
  onPreviewChange,
  onFileChange,
  onRemove,
  showRemove = false,
}: {
  preview: string | null
  serverUrl?: string | null
  onPreviewChange: (url: string | null) => void
  onFileChange: (file: File | null) => void
  onRemove?: () => void
  showRemove?: boolean
}) {
  const inputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const handleFile = (file: File | null) => {
    selectedFileRef.current = file
    onFileChange(file)
    if (file) {
      onPreviewChange(URL.createObjectURL(file))
    } else if (serverUrl) {
      onPreviewChange(withCacheBust(serverUrl))
    } else {
      onPreviewChange(null)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    window.setTimeout(() => {
      const file = selectedFileRef.current
      if (file) {
        onPreviewChange(URL.createObjectURL(file))
      } else if (serverUrl) {
        onPreviewChange(withCacheBust(serverUrl))
      } else if (preview) {
        onPreviewChange(withCacheBust(preview))
      }
      setRefreshing(false)
    }, 150)
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <label className="mb-3 block text-sm font-medium text-slate-700">Photo</label>
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-blue-100 shadow-inner ${refreshing ? 'opacity-60' : ''}`}
        >
          {preview ? (
            <img
              key={preview}
              src={preview}
              alt="Profile preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              No photo
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null
              handleFile(file)
              e.target.value = ''
            }}
          />
          <SoftButton
            variant="outline"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            Choose photo
          </SoftButton>
          <SoftButton
            variant="ghost"
            type="button"
            onClick={handleRefresh}
            title="Refresh preview"
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh photo'}
          </SoftButton>
          {showRemove && preview && onRemove && (
            <SoftButton variant="danger" type="button" onClick={onRemove}>
              Remove photo
            </SoftButton>
          )}
        </div>
      </div>
    </div>
  )
}
