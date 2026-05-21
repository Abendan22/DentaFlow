import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BrandLogo } from '../../components/BrandLogo'
import { SoftButton } from '../../components/SoftButton'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useToast } from '../../context/ToastContext'
import { FormInput, FormLabel, FieldError } from '../../components/FormField'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { fieldClass, isEmpty } from '../../utils/validation'

export function CustomerLogin() {
  const { login } = useCustomerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = { username: isEmpty(username), password: isEmpty(password) }
    setFieldErrors(errs)
    if (errs.username || errs.password) return

    setLoading(true)
    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate('/book/appointments')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Invalid username or password.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <BrandLogo size="lg" className="mx-auto mb-4" />
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            Patient Portal
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-800">Book your visit</h1>
        </div>

        <form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <FormLabel required>Username</FormLabel>
            <FormInput
              error={fieldErrors.username}
              value={username}
              autoComplete="off"
              onChange={(e) => {
                setUsername(e.target.value)
                if (e.target.value.trim()) setFieldErrors((p) => ({ ...p, username: false }))
              }}
              className="w-full rounded-xl border px-4 py-3"
            />
          </div>
          <div>
            <FormLabel required>Password</FormLabel>
            <input
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value)
                if (e.target.value) setFieldErrors((p) => ({ ...p, password: false }))
              }}
              className={fieldClass(fieldErrors.password, 'w-full rounded-xl border px-4 py-3')}
            />
            <FieldError show={fieldErrors.password} />
          </div>
          <SoftButton variant="success" type="submit" disabled={loading} className="w-full py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </SoftButton>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          No account yet?{' '}
          <Link to="/book/register" className="font-medium text-cyan-600 hover:underline">
            Create account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <Link to="/" className="hover:underline">
            Clinic staff login
          </Link>
        </p>
      </div>
    </div>
  )
}
