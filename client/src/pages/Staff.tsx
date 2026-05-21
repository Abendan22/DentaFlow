import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { Avatar } from '../components/Avatar'
import { PhotoUpload } from '../components/PhotoUpload'
import { SoftButton } from '../components/SoftButton'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/getErrorMessage'
import { submitMultipart } from '../utils/formUpload'
import { withCacheBust } from '../utils/photoUrl'
import { useDebouncedValue } from '../utils/useDebouncedValue'
import { FormInput, FormLabel } from '../components/FormField'
import { Modal } from '../components/Modal'
import { isEmpty, fieldClass } from '../utils/validation'
import type { AppUser, Gender } from '../types'

const emptyForm = {
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  phone: '',
  gender_id: '',
}

export function Staff() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
  const [staff, setStaff] = useState<AppUser[]>([])
  const [genders, setGenders] = useState<Gender[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [removePhoto, setRemovePhoto] = useState(false)
  const [serverPhotoUrl, setServerPhotoUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState({ first_name: false, last_name: false })

  const load = useCallback(async () => {
    try {
      const res = await api.get('/staff', {
        params: { search: debouncedSearch || undefined },
      })
      setStaff(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load staff records.'))
    }
  }, [debouncedSearch, toast])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    api.get('/genders').then((res) => setGenders(res.data))
  }, [])

  const resetPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setServerPhotoUrl(null)
    setRemovePhoto(false)
  }

  const openAdd = () => {
    setEditId(null)
    setForm(emptyForm)
    setErrors({ first_name: false, last_name: false })
    resetPhoto()
    setModalOpen(true)
  }

  const openEdit = (member: AppUser) => {
    setEditId(member.id)
    setForm({
      first_name: member.first_name,
      last_name: member.last_name,
      middle_name: member.middle_name ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      gender_id: member.gender_id ? String(member.gender_id) : '',
    })
    resetPhoto()
    setServerPhotoUrl(member.photo_url ?? null)
    setPhotoPreview(member.photo_url ? withCacheBust(member.photo_url) : null)
    setErrors({ first_name: false, last_name: false })
    setModalOpen(true)
  }

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('first_name', form.first_name)
    fd.append('last_name', form.last_name)
    if (form.middle_name) fd.append('middle_name', form.middle_name)
    if (form.email) fd.append('email', form.email)
    if (form.phone) fd.append('phone', form.phone)
    if (form.gender_id) fd.append('gender_id', form.gender_id)
    if (photoFile) fd.append('photo', photoFile)
    if (removePhoto) fd.append('remove_photo', '1')
    return fd
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = {
      first_name: isEmpty(form.first_name),
      last_name: isEmpty(form.last_name),
    }
    setErrors(errs)
    if (errs.first_name || errs.last_name) return

    try {
      const fd = buildFormData()
      if (editId) {
        await submitMultipart('put', `/staff/${editId}`, fd)
        toast.success('Staff record updated successfully!')
      } else {
        await submitMultipart('post', '/staff', fd)
        toast.success('Staff record saved successfully!')
      }
      setModalOpen(false)
      resetPhoto()
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save staff record.'))
    }
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this staff record?',
      onConfirm: async () => {
        try {
          await api.delete(`/staff/${id}`)
          toast.success('Staff record deleted successfully!')
          load()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete staff record.'))
        }
      },
    })
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Staff Record</h2>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
        />
        <SoftButton variant="primary" onClick={openAdd}>
          Add Staff
        </SoftButton>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No staff records yet. Click Add Staff to create one.
                </td>
              </tr>
            ) : (
              staff.map((member, i) => (
                <tr key={member.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Avatar initials={member.initials} photoUrl={member.photo_url} />
                  </td>
                  <td className="px-4 py-3 font-medium">{member.full_name}</td>
                  <td className="px-4 py-3">{member.gender ?? '—'}</td>
                  <td className="px-4 py-3">{member.phone ?? '—'}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(member)}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(member.id)}
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
        title={editId ? 'Edit Staff Record' : 'Add Staff Record'}
        onClose={() => setModalOpen(false)}
      >
        <form noValidate onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
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
          </div>
          <div>
            <FormLabel required>First Name</FormLabel>
            <FormInput
              error={errors.first_name}
              value={form.first_name}
              onChange={(e) => {
                setForm({ ...form, first_name: e.target.value })
                if (e.target.value.trim()) setErrors((p) => ({ ...p, first_name: false }))
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <FormLabel required>Last Name</FormLabel>
            <FormInput
              error={errors.last_name}
              value={form.last_name}
              onChange={(e) => {
                setForm({ ...form, last_name: e.target.value })
                if (e.target.value.trim()) setErrors((p) => ({ ...p, last_name: false }))
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <FormLabel>Middle Name</FormLabel>
            <input
              value={form.middle_name}
              onChange={(e) => setForm({ ...form, middle_name: e.target.value })}
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
            <FormLabel>Email</FormLabel>
            <input
              type="text"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
          </div>
          <div className="sm:col-span-2">
            <SoftButton variant="success" type="submit" className="w-full">
              Save
            </SoftButton>
          </div>
        </form>
      </Modal>
    </div>
  )
}
