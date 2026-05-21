import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'

interface ConfirmOptions {
  title?: string
  message: string
  onConfirm: () => void | Promise<void>
}

interface ConfirmContextValue {
  confirmDelete: (options: ConfirmOptions) => void
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null)

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('Confirm Delete')
  const [message, setMessage] = useState('')
  const [onConfirm, setOnConfirm] = useState<(() => void | Promise<void>) | null>(null)

  const confirmDelete = useCallback((options: ConfirmOptions) => {
    setTitle(options.title ?? 'Confirm Delete')
    setMessage(options.message)
    setOnConfirm(() => options.onConfirm)
    setOpen(true)
  }, [])

  const handleCancel = useCallback(() => {
    if (loading) return
    setOpen(false)
  }, [loading])

  const handleConfirm = useCallback(async () => {
    if (!onConfirm) return
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }, [onConfirm])

  const value = useMemo(() => ({ confirmDelete }), [confirmDelete])

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={open}
        title={title}
        message={message}
        loading={loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
