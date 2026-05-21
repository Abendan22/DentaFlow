import { useCallback, useEffect, useState } from 'react'
import { useDebouncedValue } from '../utils/useDebouncedValue'
import api from '../api/client'
import { Avatar } from '../components/Avatar'
import { PhotoUpload } from '../components/PhotoUpload'
import { SoftButton } from '../components/SoftButton'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/getErrorMessage'
import { submitMultipart } from '../utils/formUpload'
import { withCacheBust } from '../utils/photoUrl'
import { FormInput, FormLabel, FormSelect } from '../components/FormField'
import { Modal } from '../components/Modal'
import { fieldClass, isEmpty } from '../utils/validation'
import type { AppUser } from '../types'

const emptyForm = {
  title: 'Dr.',
  first_name: '',
  last_name: '',
  suffix: 'DDS',
  phone: '',
}

function parseDentistName(d: AppUser) {
  const lastRaw = d.last_name ?? ''
  const match = lastRaw.match(/^(.+?)\s+(DDS|DMD)$/i)
  return {
    title: d.title?.replace(/\.$/, '') || 'Dr',
    first_name: d.first_name ?? '',
    last_name: match ? match[1] : lastRaw,
    suffix: match ? match[2].toUpperCase() : (d.suffix as string) || 'DDS',
  }
}

export function Dentists() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
  const [dentists, setDentists] = useState<AppUser[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [serverPhotoUrl, setServerPhotoUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState({
    first_name: false,
    last_name: false,
    suffix: false,
  })

  const load = useCallback(async () => {
    try {
      const res = await api.get('/doctors', { params: { search: debouncedSearch || undefined } })
      setDentists(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load doctors.'))
    }
  }, [debouncedSearch, toast])

  useEffect(() => {
    load()
  }, [load])

  const resetPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setServerPhotoUrl(null)
    setRemovePhoto(false)
  }

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setErrors({ first_name: false, last_name: false, suffix: false })
    resetPhoto()
    setModalOpen(true)
  }

  const openEdit = (d: AppUser) => {
    const parsed = parseDentistName(d)
    setEditId(d.id)
    setForm({ ...parsed, phone: d.phone ?? '' })
    resetPhoto()
    setServerPhotoUrl(d.photo_url ?? null)
    setPhotoPreview(d.photo_url ? withCacheBust(d.photo_url) : null)
    setErrors({ first_name: false, last_name: false, suffix: false })
    setModalOpen(true)
  }

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('first_name', form.first_name)
    fd.append('last_name', form.last_name)
    if (form.suffix) fd.append('suffix', form.suffix)
    if (form.phone) fd.append('phone', form.phone)
    if (photoFile) fd.append('photo', photoFile)
    if (removePhoto) fd.append('remove_photo', '1')
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      first_name: isEmpty(form.first_name),
      last_name: isEmpty(form.last_name),
      suffix: isEmpty(form.suffix),
    }
    setErrors(errs)
    if (errs.first_name || errs.last_name || errs.suffix) return

    const fd = buildFormData()
    try {
      if (editId) {
        await submitMultipart('put', `/doctors/${editId}`, fd)
        toast.success('Dental doctor updated successfully!')
      } else {
        await submitMultipart('post', '/doctors', fd)
        toast.success('Dental doctor saved successfully!')
      }
      setModalOpen(false)
      resetPhoto()
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save dental doctor.'))
    }
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this dental doctor?',
      onConfirm: async () => {
        try {
          await api.delete(`/doctors/${id}`)
          toast.success('Dental doctor deleted successfully!')
          load()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete dentist.'))
        }
      },
    })
  }

  const previewName = () => {
    const title = form.title.endsWith('.') ? form.title : `${form.title}.`
    const suffix = form.suffix ? `, ${form.suffix}` : ''
    if (form.last_name && form.first_name) {
      return `${form.last_name}, ${title} ${form.first_name}${suffix}`
    }
    return `${title} ${form.first_name} ${form.last_name}${suffix}`.trim()
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-semibold text-gray-800">Dental Doctor</h2>
      <p className="mb-4 text-sm text-gray-500">Dental doctors only — Dr. with DDS or DMD credential</p>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search dentist..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
        />
        <SoftButton variant="primary" onClick={openAdd}>
          Add Dental Doctor
        </SoftButton>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[500px] text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Dental Doctor</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {dentists.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No dental doctors yet. Click Add Dental Doctor to register one.
                </td>
              </tr>
            ) : (
              dentists.map((d, i) => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Avatar initials={d.initials} photoUrl={d.photo_url} />
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{d.full_name}</td>
                  <td className="px-4 py-3">{d.phone ?? '—'}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(d)}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id)}
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

      <Modal
        open={modalOpen}
        title={editId ? 'Edit Dental Doctor' : 'Add Dental Doctor'}
        onClose={() => setModalOpen(false)}
      >
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Professional name preview
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">{previewName() || '—'}</p>
          </div>

          <PhotoUpload
            preview={photoPreview}
            serverUrl={serverPhotoUrl}
            onPreviewChange={setPhotoPreview}
            onFileChange={(file) => {
              setPhotoFile(file)
              if (file) setRemovePhoto(false)
            }}
            showRemove={!!editId}
            onRemove={() => {
              setRemovePhoto(true)
              setPhotoFile(null)
              setPhotoPreview(null)
            }}
          />

          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div>
              <FormLabel>Title</FormLabel>
              <select
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass(false, 'mt-1 w-full rounded-lg border px-2 py-2 text-sm font-medium')}
              >
                <option value="Dr.">Dr. (Dental Doctor)</option>
              </select>
            </div>
            <div>
              <FormLabel required>First name</FormLabel>
              <FormInput
                error={errors.first_name}
                value={form.first_name}
                onChange={(e) => {
                  setForm({ ...form, first_name: e.target.value })
                  if (e.target.value.trim()) setErrors((p) => ({ ...p, first_name: false }))
                }}
                placeholder="Mayra"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FormLabel required>Last name</FormLabel>
              <FormInput
                error={errors.last_name}
                value={form.last_name}
                onChange={(e) => {
                  setForm({ ...form, last_name: e.target.value })
                  if (e.target.value.trim()) setErrors((p) => ({ ...p, last_name: false }))
                }}
                placeholder="Altenwerth"
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <FormLabel required>Dental credential</FormLabel>
              <FormSelect
                error={errors.suffix}
                value={form.suffix}
                onChange={(e) => {
                  setForm({ ...form, suffix: e.target.value })
                  if (e.target.value) setErrors((p) => ({ ...p, suffix: false }))
                }}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="">Select credential</option>
                <option value="DDS">DDS — Doctor of Dental Surgery</option>
                <option value="DMD">DMD — Doctor of Dental Medicine</option>
              </FormSelect>
            </div>
          </div>

          <div>
            <FormLabel>Contact number</FormLabel>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="09XX XXX XXXX"
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>

          <SoftButton variant="success" type="submit" className="w-full">
            Save Dental Doctor
          </SoftButton>
        </form>
      </Modal>
    </div>
  )
}
