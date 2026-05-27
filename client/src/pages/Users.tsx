import { useCallback, useEffect, useState } from 'react'
import { ListLoadMore } from '../components/ListLoadMore'
import { usePaginatedList } from '../hooks/usePaginatedList'
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
  birth_date: '',
}

export function Users() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
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

  const fetchPatients = useCallback(
    async (page: number) => {
      try {
        const res = await api.get('/patients', {
          params: {
            page,
            per_page: 15,
            search: debouncedSearch || undefined,
          },
        })
        return res.data
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load patient records.'))
        throw err
      }
    },
    [debouncedSearch, toast],
  )

  const { items: users, loading, loadingMore, hasMore, total, loadMore, refresh } =
    usePaginatedList<AppUser>(fetchPatients, debouncedSearch)

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

  const openEdit = (u: AppUser) => {
    setEditId(u.id)
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      middle_name: u.middle_name ?? '',
      email: u.email ?? '',
      phone: u.phone ?? '',
      gender_id: u.gender_id ? String(u.gender_id) : '',
      birth_date: u.birth_date ?? '',
    })
    resetPhoto()
    setServerPhotoUrl(u.photo_url ?? null)
    setPhotoPreview(u.photo_url ? withCacheBust(u.photo_url) : null)
    setErrors({ first_name: false, last_name: false })
    setModalOpen(true)
  }

  const clearError = (field: 'first_name' | 'last_name', value: string) => {
    if (value.trim()) setErrors((p) => ({ ...p, [field]: false }))
  }

  const buildFormData = () => {
    const fd = new FormData()
    fd.append('first_name', form.first_name)
    fd.append('last_name', form.last_name)
    if (form.middle_name) fd.append('middle_name', form.middle_name)
    if (form.email) fd.append('email', form.email)
    if (form.phone) fd.append('phone', form.phone)
    if (form.gender_id) fd.append('gender_id', form.gender_id)
    if (form.birth_date) fd.append('birth_date', form.birth_date)
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

    const fd = buildFormData()
    try {
      if (editId) {
        await submitMultipart('put', `/patients/${editId}`, fd)
        toast.success('Patient record updated successfully!')
      } else {
        await submitMultipart('post', '/patients', fd)
        toast.success('Patient record saved successfully!')
      }
      setModalOpen(false)
      resetPhoto()
      refresh()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save patient record.'))
    }
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this patient record?',
      onConfirm: async () => {
        try {
          await api.delete(`/patients/${id}`)
          toast.success('Patient record deleted successfully!')
          refresh()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete patient record.'))
        }
      },
    })
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Patient Record</h2>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search patient records..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border px-3 py-2 text-sm"
        />
        <SoftButton variant="primary" onClick={openAdd}>
          Add Patient
        </SoftButton>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="px-4 py-3">No.</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Gender</th>
              <th className="px-4 py-3">Birth Date</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {!loading && users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No patient records yet. Click Add Patient to create one.
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Avatar initials={u.initials} photoUrl={u.photo_url} />
                  </td>
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3">{u.gender ?? '—'}</td>
                  <td className="px-4 py-3">{u.birth_date ?? '—'}</td>
                  <td className="px-4 py-3">{u.age ?? '—'}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => openEdit(u)}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(u.id)}
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
        <ListLoadMore
          hasMore={hasMore}
          loading={loading}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
          total={total}
          shown={users.length}
        />
      </div>

      <Modal
        open={modalOpen}
        title={editId ? 'Edit Patient Record' : 'Add Patient Record'}
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
                clearError('first_name', e.target.value)
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
                clearError('last_name', e.target.value)
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
            <FormLabel>Birth Date</FormLabel>
            <input
              type="date"
              value={form.birth_date}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
              className={fieldClass(false, 'mt-1 w-full rounded-lg border px-3 py-2')}
            />
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
