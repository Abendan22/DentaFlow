import { Link, NavLink, Outlet } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  IconCalendar,
  IconDashboard,
  IconDoctor,
  IconGender,
  IconPatient,
  IconReport,
  IconService,
  IconStaff,
} from './icons/SidebarIcons'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/genders', label: 'Gender', icon: IconGender },
  { to: '/users', label: 'Patient Record', icon: IconPatient },
  { to: '/doctors', label: 'Dental Doctor', icon: IconDoctor },
  { to: '/services', label: 'Services', icon: IconService },
  { to: '/staff', label: 'Staff', icon: IconStaff },
  { to: '/appointments', label: 'Appointment', icon: IconCalendar },
  { to: '/reports', label: 'Report', icon: IconReport },
]

export function Layout() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const initials = user?.initials ?? 'SA'

  return (
    <div className="flex min-h-screen">
      <aside className="no-print flex w-64 shrink-0 flex-col bg-gray-900 text-white shadow-lg">
        <div className="border-b border-white/10 px-5 py-6">
          <Link to="/dashboard" className="flex flex-col items-center gap-3 text-center">
            <BrandLogo size="lg" className="ring-white/20" />
            <div>
              <span className="block text-xl font-bold tracking-wide text-white hover:text-cyan-300">
                DentaFlow
              </span>
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Clinic System
              </p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-800/80 text-cyan-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                  <Icon />
                </span>
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print flex h-14 items-center justify-end border-b border-gray-200 bg-gray-900 px-6">
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-gray-300 sm:inline">{user?.full_name}</span>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <button
              type="button"
              onClick={async () => {
                await logout()
                toast.success('Logged out successfully!')
              }}
              className="text-sm text-gray-300 hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
