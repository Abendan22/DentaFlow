import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import api from '../api/client'
import { useAuth } from './AuthContext'

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
  register: (payload: Record<string, unknown>) => Promise<void>
  logout: () => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const { patient, loading, logout: authLogout } = useAuth()

  const register = useCallback(async (payload: Record<string, unknown>) => {
    const res = await api.post('/customer/register', payload)
    localStorage.setItem('token', res.data.token)
    window.location.href = '/book/appointments'
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
  }, [authLogout])

  const value = useMemo(
    () => ({ patient, loading, register, logout }),
    [patient, loading, register, logout],
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
