import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import { FormInput, FormLabel } from '../components/FormField'
import { getErrorMessage } from '../utils/getErrorMessage'
import { useDebouncedValue } from '../utils/useDebouncedValue'
import type { ActivityLog } from '../types'

export function ActivityLogs() {
  const toast = useToast()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search)

  const load = useCallback(async () => {
    try {
      const res = await api.get('/activity-logs', {
        params: { search: debouncedSearch || undefined },
      })
      setLogs(res.data)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load activity logs.'))
    }
  }, [debouncedSearch, toast])

  useEffect(() => {
    load()
  }, [load])

  const formatTime = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString()
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Activity Logs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Login, logout, and security events recorded for accountability.
        </p>
      </div>

      <div className="mb-4 max-w-md">
        <FormLabel>Search</FormLabel>
        <FormInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="User, activity, or IP address"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Username</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Full name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Activity</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No activity logs yet. Try logging in or out to generate entries.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{log.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-cyan-700">{log.username}</span>
                    {log.role && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {log.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-800">{log.user_name}</td>
                  <td className="px-4 py-3 text-gray-800">{log.activity}</td>
                  <td className="px-4 py-3 text-gray-600">{log.ip_address ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-600">
                    {formatTime(log.timestamp)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
