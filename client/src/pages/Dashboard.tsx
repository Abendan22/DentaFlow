import { useCallback, useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../context/ToastContext'
import {
  IconActivity,
  IconCalendar,
  IconClinic,
  IconDoctor,
  IconUsers,
} from '../components/icons/SidebarIcons'
import { getErrorMessage } from '../utils/getErrorMessage'

interface AgeGroup {
  label: string
  count: number
}

interface DashboardStats {
  total_clinics: number
  total_active_services: number
  total_appointments: number
  total_doctors: number
  total_patients: number
  patients_by_age: AgeGroup[]
  filter_date?: string | null
}

const metricCards = [
  {
    key: 'total_clinics' as const,
    label: 'Total Number of Clinics',
    icon: IconClinic,
    accent: 'from-blue-500 to-blue-600',
    iconBg: 'bg-blue-50 text-blue-600 ring-blue-100',
    glow: 'shadow-blue-500/10',
  },
  {
    key: 'total_active_services' as const,
    label: 'Total Active Services',
    icon: IconActivity,
    accent: 'from-cyan-500 to-teal-600',
    iconBg: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
    glow: 'shadow-cyan-500/10',
  },
  {
    key: 'total_appointments' as const,
    label: 'Total Appointments',
    icon: IconCalendar,
    accent: 'from-indigo-500 to-violet-600',
    iconBg: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    glow: 'shadow-indigo-500/10',
  },
  {
    key: 'total_doctors' as const,
    label: 'Total Number of Doctors',
    icon: IconDoctor,
    accent: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-50 text-violet-600 ring-violet-100',
    glow: 'shadow-violet-500/10',
  },
  {
    key: 'total_patients' as const,
    label: 'Total Number of Patients',
    icon: IconUsers,
    accent: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    glow: 'shadow-emerald-500/10',
  },
]

const ageStyles = [
  {
    match: '0-25',
    bg: 'bg-gradient-to-b from-rose-50 to-blue-50',
    ring: 'ring-rose-100',
    count: 'text-rose-600',
  },
  {
    match: '26-50',
    bg: 'bg-gradient-to-b from-slate-50 to-violet-50',
    ring: 'ring-slate-200',
    count: 'text-indigo-600',
  },
  {
    match: '50+',
    bg: 'bg-gradient-to-b from-gray-50 to-purple-50',
    ring: 'ring-gray-200',
    count: 'text-purple-600',
  },
]

function AgeIcon({ group }: { group: string }) {
  if (group.startsWith('0-25')) {
    return (
      <div className="flex items-end justify-center gap-3">
        <svg viewBox="0 0 48 64" className="h-[72px] w-11 drop-shadow-sm" aria-hidden>
          <circle cx="24" cy="14" r="10" fill="#fb7185" />
          <rect x="14" y="26" width="20" height="30" rx="8" fill="#38bdf8" />
        </svg>
        <svg viewBox="0 0 48 64" className="h-16 w-10 drop-shadow-sm" aria-hidden>
          <circle cx="24" cy="14" r="9" fill="#f472b6" />
          <path d="M12 28 Q24 40 36 28 L34 56 Q24 62 14 56 Z" fill="#7dd3fc" />
        </svg>
      </div>
    )
  }
  if (group.startsWith('26-50')) {
    return (
      <div className="flex items-end justify-center gap-3">
        <svg viewBox="0 0 48 72" className="h-[76px] w-11 drop-shadow-sm" aria-hidden>
          <circle cx="24" cy="12" r="10" fill="#fb7185" />
          <rect x="12" y="24" width="24" height="38" rx="5" fill="#1e3a5f" />
          <rect x="10" y="50" width="10" height="18" rx="2" fill="#1e3a5f" />
          <rect x="28" y="50" width="10" height="18" rx="2" fill="#1e3a5f" />
        </svg>
        <svg viewBox="0 0 48 72" className="h-[76px] w-11 drop-shadow-sm" aria-hidden>
          <circle cx="24" cy="12" r="10" fill="#fb7185" />
          <path d="M14 24 L34 24 L31 60 Q24 66 17 60 Z" fill="#8b5cf6" />
        </svg>
      </div>
    )
  }
  return (
    <div className="flex items-end justify-center gap-3">
      <svg viewBox="0 0 56 72" className="h-[76px] w-12 drop-shadow-sm" aria-hidden>
        <circle cx="28" cy="12" r="10" fill="#fb7185" />
        <ellipse cx="28" cy="40" rx="14" ry="18" fill="#64748b" />
        <line x1="8" y1="54" x2="0" y2="70" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 48 72" className="h-[76px] w-11 drop-shadow-sm" aria-hidden>
        <circle cx="24" cy="12" r="10" fill="#fb7185" />
        <ellipse cx="24" cy="40" rx="12" ry="17" fill="#a78bfa" />
      </svg>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  iconBg,
  glow,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  accent: string
  iconBg: string
  glow: string
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/80 bg-white p-6 shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${glow}`}
    >
      <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.07] transition group-hover:opacity-[0.12] ${accent}`}
      />

      <p className="relative max-w-[70%] text-sm font-medium leading-snug text-gray-600">
        {label}
      </p>
      <p className="relative mt-4 text-4xl font-bold tracking-tight text-gray-900">{value}</p>

      <span
        className={`absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-4 transition duration-300 group-hover:scale-105 ${iconBg}`}
      >
        <Icon className="h-7 w-7" />
      </span>
    </div>
  )
}

function MetricSkeleton() {
  return (
    <div className="relative animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-6 h-10 w-16 rounded bg-gray-200" />
      <div className="absolute bottom-5 right-5 h-14 w-14 rounded-2xl bg-gray-100" />
    </div>
  )
}

function getAgeStyle(label: string) {
  return ageStyles.find((s) => label.startsWith(s.match)) ?? ageStyles[2]
}

export function Dashboard() {
  const toast = useToast()
  const [date, setDate] = useState('')
  const [appliedDate, setAppliedDate] = useState<string | undefined>(undefined)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(
    async (filterDate?: string) => {
      setLoading(true)
      try {
        const params = filterDate ? { date: filterDate } : {}
        const res = await api.get<DashboardStats>('/dashboard/stats', { params })
        setStats(res.data)
      } catch (err) {
        setStats(null)
        toast.error(getErrorMessage(err, 'Failed to load dashboard.'))
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    loadStats(appliedDate)
  }, [loadStats, appliedDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedDate(date || undefined)
  }

  const formattedFilter = appliedDate
    ? new Date(appliedDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="min-h-full">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">Performance</h1>
          {formattedFilter && (
            <p className="mt-1 text-sm text-gray-500">Showing data for {formattedFilter}</p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm"
        >
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <IconCalendar className="h-4 w-4 shrink-0 text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-sm text-gray-700 outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-gray-800 hover:to-black hover:shadow-lg"
          >
            Submit
          </button>
          {appliedDate && (
            <button
              type="button"
              onClick={() => {
                setDate('')
                setAppliedDate(undefined)
              }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <MetricSkeleton key={i} />
            ))}
          </div>
          <div className="h-96 w-full animate-pulse rounded-2xl bg-white shadow-sm xl:w-[380px]" />
        </div>
      ) : !stats ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">Unable to load dashboard data.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 xl:flex-row">
          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {metricCards.map((card) => (
              <MetricCard
                key={card.key}
                label={card.label}
                value={stats[card.key]}
                icon={card.icon}
                accent={card.accent}
                iconBg={card.iconBg}
                glow={card.glow}
              />
            ))}
          </div>

          <div className="w-full shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md xl:w-[380px]">
            <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 to-cyan-50/50 px-6 py-5">
              <h2 className="text-center text-lg font-bold text-gray-800">
                Visited Patient by age
              </h2>
              <p className="mt-1 text-center text-xs text-gray-500">
                Patient visits grouped by age range
              </p>
            </div>

            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:justify-center xl:flex-col">
              {stats.patients_by_age.map((group) => {
                const style = getAgeStyle(group.label)
                return (
                  <div
                    key={group.label}
                    className={`flex flex-1 flex-col items-center rounded-2xl p-5 ring-1 transition hover:shadow-md ${style.bg} ${style.ring}`}
                  >
                    <p className="mb-4 text-sm font-bold text-gray-700">{group.label}</p>
                    <div className="flex min-h-[88px] items-center justify-center">
                      <AgeIcon group={group.label} />
                    </div>
                    <p className={`mt-5 text-4xl font-bold ${style.count}`}>{group.count}</p>
                    <p className="mt-1 text-xs text-gray-500">patients</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
