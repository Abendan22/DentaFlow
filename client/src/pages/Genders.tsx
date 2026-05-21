import { useEffect, useState } from 'react'
import api from '../api/client'
import { SoftButton } from '../components/SoftButton'
import { useConfirm } from '../context/ConfirmContext'
import { useToast } from '../context/ToastContext'
import { FormInput, FormLabel } from '../components/FormField'
import { getErrorMessage } from '../utils/getErrorMessage'
import { isEmpty } from '../utils/validation'
import type { Gender } from '../types'

export function Genders() {
  const toast = useToast()
  const { confirmDelete } = useConfirm()
  const [genders, setGenders] = useState<Gender[]>([])
  const [name, setName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [nameError, setNameError] = useState(false)

  const load = async () => {
    try {
      const res = await api.get('/genders')
      setGenders(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load genders.'))
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isEmpty(name)) {
      setNameError(true)
      return
    }
    try {
      if (editId) {
        await api.put(`/genders/${editId}`, { name })
        toast.success('Gender updated successfully!')
      } else {
        await api.post('/genders', { name })
        toast.success('Gender saved successfully!')
      }
      setName('')
      setEditId(null)
      setNameError(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save gender.'))
    }
  }

  const handleEdit = (g: Gender) => {
    setEditId(g.id)
    setName(g.name)
    setNameError(false)
  }

  const handleDelete = (id: number) => {
    confirmDelete({
      message: 'Are you sure you want to delete this gender?',
      onConfirm: async () => {
        try {
          await api.delete(`/genders/${id}`)
          toast.success('Gender deleted successfully!')
          load()
        } catch (err) {
          toast.error(getErrorMessage(err, 'Failed to delete gender.'))
        }
      },
    })
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="grid gap-8 lg:grid-cols-2">
        <form noValidate onSubmit={handleSubmit}>
          <FormLabel required>Gender</FormLabel>
          <FormInput
            error={nameError}
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (e.target.value.trim()) setNameError(false)
            }}
            className="mb-4 w-full rounded-lg border px-3 py-2"
            placeholder="e.g. Male"
          />
          <SoftButton variant="success" type="submit">
            {editId ? 'Update Gender' : 'Save Gender'}
          </SoftButton>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null)
                setName('')
              }}
              className="ml-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </form>

        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3">No.</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {genders.map((g, i) => (
                <tr key={g.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3">{g.name}</td>
                  <td className="px-4 py-3 space-x-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(g)}
                      className="font-medium text-green-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id)}
                      className="font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
