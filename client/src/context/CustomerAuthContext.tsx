import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import customerApi from '../api/customerApi'

export interface CustomerPatient {
  id: number
  username: string
  first_name: string
  last_name: string
  full_name: string
  email?: string | null
  phone?: string | null
}

interface CustomerAuthContextValue {
  patient: CustomerPatient | null
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  register: (payload: Record<string, unknown>) => Promise<void>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [patient, setPatient] = useState<CustomerPatient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('customer_token')
    if (!token) {
      setLoading(false)
      return
    }
    customerApi
      .get('/customer/me')
      .then((res) => setPatient(res.data.patient))
      .catch(() => localStorage.removeItem('customer_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const res = await customerApi.post('/customer/login', { username, password })
    localStorage.setItem('customer_token', res.data.token)
    setPatient(res.data.patient)
  }, [])

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const res = await customerApi.post('/customer/register', payload)
    localStorage.setItem('customer_token', res.data.token)
    setPatient(res.data.patient)
  }, [])

  const logout = useCallback(async () => {
    try {
      await customerApi.post('/customer/logout')
    } catch {
      /* ignore */
    }
    localStorage.removeItem('customer_token')
    setPatient(null)
  }, [])

  const value = useMemo(
    () => ({ patient, loading, login, register, logout }),
    [patient, loading, login, register, logout],
  )

  return (
    <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider')
  return ctx
}
