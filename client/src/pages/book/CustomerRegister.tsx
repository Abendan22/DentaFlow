import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { BrandLogo } from '../../components/BrandLogo'
import { SoftButton } from '../../components/SoftButton'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { useToast } from '../../context/ToastContext'
import { FormInput, FormLabel } from '../../components/FormField'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { fieldClass, isEmpty } from '../../utils/validation'
import type { Gender } from '../../types'

export function CustomerRegister() {
  const { register } = useCustomerAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [genders, setGenders] = useState<Gender[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    email: '',
    phone: '',
    gender_id: '',
    birth_date: '',
  })
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    username: false,
    password: false,
  })

  useEffect(() => {
    axios.get('/api/genders').then((res) => setGenders(res.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      first_name: isEmpty(form.first_name),
      last_name: isEmpty(form.last_name),
      username: isEmpty(form.username),
      // Dito binago ang validation logic (min 6, max 15)
      password: isEmpty(form.password) || form.password.length < 6 || form.password.length > 15,
    }
    setErrors(errs)
    if (errs.first_name || errs.last_name || errs.username || errs.password) return

    setLoading(true)
    try {
      await register({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        password: form.password,
        email: form.email || null,
        phone: form.phone || null,
        gender_id: form.gender_id ? Number(form.gender_id) : null,
        birth_date: form.birth_date || null,
      })
      toast.success('Account created! You can book an appointment now.')
      navigate('/book/appointments')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Registration failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <BrandLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-800">Create patient account</h1>
          <p className="mt-1 text-sm text-slate-500">Book cleaning, extraction, and more online</p>
        </div>

        <form noValidate autoComplete="off" onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div>
            <FormLabel required>First Name</FormLabel>
            <FormInput
              error={errors.first_name}
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <FormLabel required>Last Name</FormLabel>
            <FormInput
              error={errors.last_name}
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            <FormLabel required>Username</FormLabel>
            <FormInput
              error={errors.username}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div className="sm:col-span-2">
            {/* Dito binago ang Label at Input ng Password */}
            <FormLabel required>Password (6-15 characters)</FormLabel>
            <input
              type="password"
              value={form.password}
              autoComplete="new-password"
              maxLength={15}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={fieldClass(errors.password, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div>
            <FormLabel>Email</FormLabel>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div>
            <FormLabel>Phone</FormLabel>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div>
            <FormLabel>Gender</FormLabel>
            <select
              value={form.gender_id}
              onChange={(e) => setForm({ ...form, gender_id: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            >
              <option value="">—</option>
              {genders.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel>Birth Date</FormLabel>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div className="sm:col-span-2">
            <SoftButton variant="success" type="submit" disabled={loading} className="w-full py-3">
              {loading ? 'Creating...' : 'Create Account'}
            </SoftButton>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/book/login" className="font-medium text-cyan-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}