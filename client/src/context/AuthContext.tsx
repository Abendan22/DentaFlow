import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api from '../api/client'
import type { AppUser } from '../types'
import type { CustomerPatient } from './CustomerAuthContext'

export type LoginResult = { role: 'admin' | 'user' }

interface AuthContextValue {
  user: AppUser | null
  patient: CustomerPatient | null
  loading: boolean
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [patient, setPatient] = useState<CustomerPatient | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback((data: { user: AppUser; patient?: CustomerPatient }) => {
    setUser(data.user)
    setPatient(data.user.role === 'user' ? (data.patient ?? null) : null)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    api
      .get('/me')
      .then((res) => applySession(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [applySession])

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const res = await api.post('/login', { username, password })
      localStorage.setItem('token', res.data.token)
      applySession({ user: res.data.user, patient: res.data.patient })
      return { role: res.data.user.role as 'admin' | 'user' }
    },
    [applySession],
  )

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      /* ignore */
    }
    localStorage.removeItem('token')
    setUser(null)
    setPatient(null)
  }, [])

  const value = useMemo(
    () => ({ user, patient, loading, login, logout }),
    [user, patient, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
