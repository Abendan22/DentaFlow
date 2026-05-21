import { useEffect, useState } from 'react'
import api from '../api/client'
import { SoftButton } from '../components/SoftButton'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../utils/getErrorMessage'
import type { ReportData } from '../types'

type ReportType = 'appointments' | 'patients'

export function Reports() {
  const toast = useToast()
  const [type, setType] = useState<ReportType>('appointments')
  const [from, setFrom] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState('')
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReport = async (showToast: boolean) => {
    setLoading(true)
    try {
      const url =
        type === 'appointments' ? '/reports/appointments' : '/reports/patients'
      const res = await api.get(url, {
        params:
          type === 'appointments'
            ? { from, to, status: status || undefined }
            : undefined,
      })
      setReport(res.data)
      if (showToast) toast.success('Report generated successfully!')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to generate report.'))
    } finally {
      setLoading(false)
    }
  }

  const generate = () => fetchReport(true)

  useEffect(() => {
    fetchReport(false)
  }, [])

  const handlePrint = () => window.print()

  const columns =
    report?.rows?.[0] != null ? Object.keys(report.rows[0]) : []

  return (
    <div className="space-y-6">
      <div className="no-print rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Generate Report</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm font-medium">Report Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              className="mt-1 block rounded-lg border px-3 py-2"
            >
              <option value="appointments">Appointments</option>
              <option value="patients">Patient Records</option>
            </select>
          </div>
          {type === 'appointments' && (
            <>
              <div>
                <label className="text-sm font-medium">From</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 block rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">To</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 block rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 block rounded-lg border px-3 py-2"
                >
                  <option value="">All</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </>
          )}
          <SoftButton variant="primary" onClick={generate} disabled={loading}>
            {loading ? 'Loading...' : 'Generate'}
          </SoftButton>
          <SoftButton variant="success" onClick={handlePrint} disabled={!report}>
            Print
          </SoftButton>
        </div>
      </div>

      {report && (
        <div className="print-area rounded-xl bg-white p-8 shadow-sm">
          <div className="mb-6 border-b pb-4 text-center">
            <h1 className="text-2xl font-bold text-gray-900">DentaFlow</h1>
            <h2 className="mt-1 text-lg font-semibold text-gray-700">
              {report.title}
            </h2>
            {report.from && report.to && (
              <p className="text-sm text-gray-500">
                Period: {report.from} to {report.to}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Generated: {report.generated_at}
            </p>
          </div>

          {Object.keys(report.summary).length > 0 && (
            <div className="mb-6 flex flex-wrap justify-center gap-6 text-sm">
              {Object.entries(report.summary).map(([key, val]) => (
                <div key={key} className="rounded-lg bg-gray-100 px-4 py-2">
                  <span className="font-medium capitalize">{key}: </span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="px-3 py-2">No.</th>
                  {columns.map((col) => (
                    <th key={col} className="px-3 py-2 capitalize">
                      {col.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="px-3 py-2">{i + 1}</td>
                    {columns.map((col) => (
                      <td key={col} className="px-3 py-2">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
