import { SoftButton } from './SoftButton'

export function ConfirmDialog({
  open,
  title = 'Confirm Delete',
  message,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title?: string
  message: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        role="alertdialog"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="mb-5 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
            <svg
              className="h-8 w-8 text-rose-500"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path
                d="M9 9l6 6M15 9l-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 id="confirm-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          <p id="confirm-message" className="mt-2 text-sm text-gray-600">
            {message}
          </p>
        </div>
        <div className="flex gap-3">
          <SoftButton
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </SoftButton>
          <SoftButton
            variant="danger"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </SoftButton>
        </div>
      </div>
    </div>
  )
}
