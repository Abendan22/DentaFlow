import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundTeeth from '../assets/backgroundteeth1.jpg'
import { BrandLogo } from '../components/BrandLogo'
import { SoftButton } from '../components/SoftButton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { FormInput, FormLabel } from '../components/FormField'
import { getErrorMessage } from '../utils/getErrorMessage'
import { FieldError } from '../components/FormField'
import { fieldClass, isEmpty } from '../utils/validation'

export function Login() {
  const { login, user, loading: authLoading } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ username: false, password: false })

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    if (user.role === 'admin') {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/book/appointments', { replace: true })
    }
  }, [user, authLoading, navigate])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = { username: isEmpty(username), password: isEmpty(password) }
    setFieldErrors(errs)
    if (errs.username || errs.password) return

    setError('')
    setSubmitting(true)
    try {
      const result = await login(username, password)
      if (result.role === 'user') {
        toast.success('Welcome back!')
        navigate('/book/appointments')
      } else {
        toast.success('Login successful!')
        navigate('/dashboard')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid username or password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-50">
      <div className="pointer-events-none absolute inset-0 lg:left-[40%]">
        <img
          src={backgroundTeeth}
          alt=""
          className="h-full w-full object-cover object-[65%_center] lg:object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-slate-50/75 to-transparent lg:from-slate-50 lg:via-slate-50/30 lg:to-transparent" />
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-[40%] lg:max-w-xl lg:shrink-0 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-cyan-600">
              Welcome to
            </p>

            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <BrandLogo size="md" />
              <h1 className="bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
                DentaGlow
              </h1>
            </div>

            <p className="mt-2 text-slate-500">
              Sign in as <strong>admin</strong> (clinic) or <strong>user</strong> (patient)
            </p>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/95 p-8 shadow-xl shadow-blue-900/5">
            <h2 className="mb-6 text-center text-lg font-semibold text-slate-800 lg:text-left">
              Sign in to your account
            </h2>

            {error && (
              <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <FormLabel required>Username</FormLabel>
                <FormInput
                  error={fieldErrors.username}
                  value={username}
                  name="df-username"
                  autoComplete="off"
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (e.target.value.trim()) setFieldErrors((p) => ({ ...p, username: false }))
                  }}
                  placeholder="Enter username"
                  className="w-full rounded-xl border px-4 py-3"
                />
              </div>
              <div>
                <FormLabel required>Password</FormLabel>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    name="df-password"
                    autoComplete="new-password"
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (e.target.value) setFieldErrors((p) => ({ ...p, password: false }))
                    }}
                    placeholder="Enter password"
                    className={fieldClass(
                      fieldErrors.password,
                      'w-full rounded-xl border px-4 py-3 pr-12',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <FieldError show={fieldErrors.password} />
              </div>
              <SoftButton
                variant="success"
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 text-base shadow-md shadow-emerald-500/20"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </SoftButton>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
            New user?{' '}
            <a href="/book/register" className="font-medium text-cyan-600 hover:underline">
              Create an account
            </a>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400 lg:text-left">
            © DentaGlow — Dental clinic management system
          </p>
        </div>
      </div>

      <div className="hidden flex-1 lg:block" aria-hidden />
    </div>
  )
}
