import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import customerApi from '../../api/customerApi'
import { Modal } from '../../components/Modal'
import { SoftButton } from '../../components/SoftButton'
import { FormInput, FormLabel, FormSelect } from '../../components/FormField'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { isEmpty } from '../../utils/validation'
import type { CustomerAppointment, Service } from '../../types'

const statusLabel: Record<string, { text: string; className: string }> = {
  pending: { text: 'Waiting for approval', className: 'bg-amber-100 text-amber-800' },
  approved: { text: 'Approved', className: 'bg-green-100 text-green-800' },
  rejected: { text: 'Not approved', className: 'bg-red-100 text-red-800' },
  completed: { text: 'Completed', className: 'bg-blue-100 text-blue-800' },
  cancelled: { text: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
}

const emptyForm = {
  service_id: '',
  appointment_date: '',
  appointment_time: '',
  notes: '',
}

export function CustomerAppointments() {
  const toast = useToast()
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({
    service_id: false,
    appointment_date: false,
    appointment_time: false,
  })

  const load = useCallback(async () => {
    try {
      const res = await customerApi.get<CustomerAppointment[]>('/customer/appointments')
      setAppointments(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load appointments.'))
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
    axios.get('/api/public/services').then((res) => setServices(res.data))
  }, [load])

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      service_id: isEmpty(form.service_id),
      appointment_date: isEmpty(form.appointment_date),
      appointment_time: isEmpty(form.appointment_time),
    }
    setErrors(errs)
    if (errs.service_id || errs.appointment_date || errs.appointment_time) return

    try {
      await customerApi.post('/customer/appointments', {
        service_id: Number(form.service_id),
        appointment_date: form.appointment_date,
        appointment_time: form.appointment_time,
        notes: form.notes || null,
      })
      toast.success('Appointment request sent! Wait for clinic approval.')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to book appointment.'))
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">My Appointments</h2>
          <p className="text-sm text-gray-500">
            Book a service and check if the clinic approved your visit.
          </p>
        </div>
        <SoftButton variant="primary" onClick={() => setModalOpen(true)}>
          Book Appointment
        </SoftButton>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No appointments yet. Click Book Appointment to request a visit.
                </td>
              </tr>
            ) : (
              appointments.map((a) => {
                const st = statusLabel[a.status] ?? {
                  text: a.status,
                  className: 'bg-gray-100 text-gray-600',
                }
                return (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.service_name ?? '—'}</td>
                    <td className="px-4 py-3">{a.appointment_date}</td>
                    <td className="px-4 py-3">{a.appointment_time}</td>
                    <td className="px-4 py-3">{a.doctor_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${st.className}`}
                      >
                        {st.text}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Book Appointment" onClose={() => setModalOpen(false)}>
        <form noValidate onSubmit={handleBook} className="space-y-4">
          <div>
            <FormLabel required>Select Service</FormLabel>
            <FormSelect
              error={errors.service_id}
              value={form.service_id}
              onChange={(e) => {
                setForm({ ...form, service_id: e.target.value })
                if (e.target.value) setErrors((p) => ({ ...p, service_id: false }))
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Choose service (e.g. cleaning, extraction)</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.price != null ? ` — ₱${s.price.toLocaleString()}` : ''}
                </option>
              ))}
            </FormSelect>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel required>Preferred Date</FormLabel>
              <FormInput
                error={errors.appointment_date}
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.appointment_date}
                onChange={(e) => {
                  setForm({ ...form, appointment_date: e.target.value })
                  if (e.target.value) setErrors((p) => ({ ...p, appointment_date: false }))
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <FormLabel required>Preferred Time</FormLabel>
              <FormInput
                error={errors.appointment_time}
                type="time"
                value={form.appointment_time}
                onChange={(e) => {
                  setForm({ ...form, appointment_time: e.target.value })
                  if (e.target.value) setErrors((p) => ({ ...p, appointment_time: false }))
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>
          <div>
            <FormLabel>Notes (optional)</FormLabel>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Any concern for the dentist?"
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <SoftButton variant="success" type="submit" className="w-full">
            Submit Request
          </SoftButton>
        </form>
      </Modal>
    </div>
  )
}
