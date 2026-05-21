import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { Modal } from '../components/Modal'
import { FormInput, FormLabel, FormSelect } from '../components/FormField'
import { SoftButton } from '../components/SoftButton'
import { fieldClass, isEmpty } from '../utils/validation'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/getErrorMessage'
import type { Appointment } from '../types'

interface Option {
  id: number
  full_name: string
}

const emptyForm = {
  patient_id: '',
  service_id: '',
  doctor_id: '',
  appointment_date: '',
  appointment_time: '',
  status: 'approved',
  notes: '',
}

export function Appointments() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<Option[]>([])
  const [doctors, setDoctors] = useState<Option[]>([])
  const [services, setServices] = useState<Option[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({
    patient_id: false,
    appointment_date: false,
    appointment_time: false,
  })

  const loadAppointments = useCallback(async () => {
    try {
      const res = await api.get<Appointment[]>('/appointments')
      setAppointments(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load appointments.'))
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadAppointments()
    Promise.all([
      api.get('/patients/options'),
      api.get('/doctors/options'),
      api.get('/services'),
    ]).then(([patientsRes, doctorsRes, servicesRes]) => {
      setPatients(patientsRes.data)
      setDoctors(doctorsRes.data)
      setServices(
        servicesRes.data.map((s: { id: number; name: string }) => ({
          id: s.id,
          full_name: s.name,
        })),
      )
    })
  }, [loadAppointments])

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setErrors({ patient_id: false, appointment_date: false, appointment_time: false })
    setModalOpen(true)
  }

  const openEdit = (a: Appointment) => {
    setEditId(a.id)
    setForm({
      patient_id: String(a.patient_id),
      service_id: a.service_id ? String(a.service_id) : '',
      doctor_id: a.doctor_id ? String(a.doctor_id) : '',
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      status: a.status,
      notes: a.notes ?? '',
    })
    setErrors({ patient_id: false, appointment_date: false, appointment_time: false })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      patient_id: isEmpty(form.patient_id),
      appointment_date: isEmpty(form.appointment_date),
      appointment_time: isEmpty(form.appointment_time),
    }
    setErrors(errs)
    if (errs.patient_id || errs.appointment_date || errs.appointment_time) return

    const payload = {
      patient_id: Number(form.patient_id),
      service_id: form.service_id ? Number(form.service_id) : null,
      doctor_id: form.doctor_id ? Number(form.doctor_id) : null,
      appointment_date: form.appointment_date,
      appointment_time: form.appointment_time,
      status: form.status,
      notes: form.notes || null,
    }
    try {
      if (editId) {
        await api.put(`/appointments/${editId}`, payload)
        toast.success('Appointment updated successfully!')
      } else {
        await api.post('/appointments', payload)
        toast.success('Appointment scheduled successfully!')
      }
      setModalOpen(false)
      await loadAppointments()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save appointment.'))
    }
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this appointment?',
      onConfirm: async () => {
        try {
          await api.delete(`/appointments/${id}`)
          toast.success('Appointment deleted successfully!')
          await loadAppointments()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete appointment.'))
        }
      },
    })
  }

  const handleApprove = async (id: number, doctorId?: string) => {
    try {
      await api.post(`/appointments/${id}/approve`, {
        doctor_id: doctorId ? Number(doctorId) : null,
      })
      toast.success('Appointment approved!')
      await loadAppointments()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to approve.'))
    }
  }

  const handleReject = async (id: number) => {
    try {
      await api.post(`/appointments/${id}/reject`)
      toast.success('Appointment rejected.')
      await loadAppointments()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reject.'))
    }
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    scheduled: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex justify-end">
        <SoftButton variant="primary" onClick={openAdd}>
          Schedule Appointment
        </SoftButton>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  Loading appointments...
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No appointments scheduled yet.
                </td>
              </tr>
            ) : (
              appointments.map((a, i) => (
                <tr key={a.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{a.appointment_date}</td>
                  <td className="px-4 py-3">{a.appointment_time}</td>
                  <td className="px-4 py-3">{a.patient_name ?? '—'}</td>
                  <td className="px-4 py-3">{a.service_name ?? '—'}</td>
                  <td className="px-4 py-3">{a.doctor_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColor[a.status] ?? 'bg-gray-100'}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{a.source ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {a.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleApprove(a.id, a.doctor_id ? String(a.doctor_id) : undefined)}
                            className="font-medium text-green-600 hover:underline"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(a.id)}
                            className="font-medium text-red-600 hover:underline"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editId ? 'Edit Appointment' : 'Schedule Appointment'}
        onClose={() => setModalOpen(false)}
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-3">
          <div>
            <FormLabel required>Patient</FormLabel>
            <FormSelect
              error={errors.patient_id}
              value={form.patient_id}
              onChange={(e) => {
                setForm({ ...form, patient_id: e.target.value })
                if (e.target.value) setErrors((p) => ({ ...p, patient_id: false }))
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select patient</option>
              {patients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </FormSelect>
          </div>
          <div>
            <FormLabel>Service</FormLabel>
            <select
              value={form.service_id}
              onChange={(e) => setForm({ ...form, service_id: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            >
              <option value="">Select service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FormLabel>Dental Doctor</FormLabel>
            <select
              value={form.doctor_id}
              onChange={(e) => setForm({ ...form, doctor_id: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            >
              <option value="">Select dental doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel required>Date</FormLabel>
              <FormInput
                error={errors.appointment_date}
                type="date"
                value={form.appointment_date}
                onChange={(e) => {
                  setForm({ ...form, appointment_date: e.target.value })
                  if (e.target.value) setErrors((p) => ({ ...p, appointment_date: false }))
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <FormLabel required>Time</FormLabel>
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
            <FormLabel>Status</FormLabel>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <FormLabel>Notes</FormLabel>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <SoftButton variant="success" type="submit" className="w-full">
            Save
          </SoftButton>
        </form>
      </Modal>
    </div>
  )
}
