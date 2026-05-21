import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { SoftButton } from '../components/SoftButton'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { FormInput, FormLabel } from '../components/FormField'
import { getErrorMessage } from '../utils/getErrorMessage'
import { useDebouncedValue } from '../utils/useDebouncedValue'
import { fieldClass, isEmpty } from '../utils/validation'
import type { Service } from '../types'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  is_active: true,
}

export function Services() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
  const [services, setServices] = useState<Service[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [nameError, setNameError] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/services', { params: { search: debouncedSearch || undefined } })
      setServices(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load services.'))
    }
  }, [debouncedSearch, toast])

  useEffect(() => {
    load()
  }, [load])

  const resetForm = () => {
    setForm(emptyForm)
    setEditId(null)
    setNameError(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEmpty(form.name)) {
      setNameError(true)
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: form.price ? Number(form.price) : null,
      is_active: form.is_active,
    }

    try {
      if (editId) {
        await api.put(`/services/${editId}`, payload)
        toast.success('Service updated successfully!')
      } else {
        await api.post('/services', payload)
        toast.success('Service saved successfully!')
      }
      resetForm()
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save service.'))
    }
  }

  const handleEdit = (s: Service) => {
    setEditId(s.id)
    setForm({
      name: s.name,
      description: s.description ?? '',
      price: s.price != null ? String(s.price) : '',
      is_active: s.is_active,
    })
    setNameError(false)
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this service?',
      onConfirm: async () => {
        try {
          await api.delete(`/services/${id}`)
          toast.success('Service deleted successfully!')
          load()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete service.'))
        }
      },
    })
  }

  const formatPrice = (price: number | null | undefined) =>
    price != null ? `₱${price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : '—'

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Services</h2>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
        />
        <SoftButton variant="primary" onClick={resetForm}>
          Add Service
        </SoftButton>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <form noValidate onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-slate-50/50 p-4">
          <h3 className="font-medium text-gray-800">
            {editId ? 'Edit Service' : 'New Service'}
          </h3>
          <div>
            <FormLabel required>Service Name</FormLabel>
            <FormInput
              error={nameError}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value })
                if (e.target.value.trim()) setNameError(false)
              }}
              placeholder="e.g. Dental Cleaning"
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <FormLabel>Description</FormLabel>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description"
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div>
            <FormLabel>Price (₱)</FormLabel>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.00"
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            Active service
          </label>
          <div className="flex flex-wrap gap-2">
            <SoftButton variant="success" type="submit">
              {editId ? 'Update Service' : 'Save Service'}
            </SoftButton>
            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {services.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No services yet. Add one using the form.
                  </td>
                </tr>
              ) : (
                services.map((s, i) => (
                  <tr key={s.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.name}</p>
                      {s.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">{formatPrice(s.price)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {s.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(s)}
                        className="font-medium text-green-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
