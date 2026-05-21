export interface ToastItem {
  id: number
  type: 'success' | 'error'
  message: string
}

function CheckIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="fill-green-500" />
      <path
        d="M8 12.5l2.5 2.5L16 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" className="fill-red-500" />
      <path
        d="M9 9l6 6M15 9l-6 6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: ToastItem[]
  onClose: (id: number) => void
}) {
  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`toast-popup pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {toast.type === 'success' ? <CheckIcon /> : <ErrorIcon />}
          <p className="flex-1 pt-0.5 text-sm font-medium">{toast.message}</p>
          <button
            type="button"
            onClick={() => onClose(toast.id)}
            className={`shrink-0 rounded p-0.5 text-lg leading-none ${
              toast.type === 'success'
                ? 'text-green-600 hover:bg-green-100'
                : 'text-red-600 hover:bg-red-100'
            }`}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
