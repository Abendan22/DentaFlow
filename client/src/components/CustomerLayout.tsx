import { Link, NavLink, Outlet } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useToast } from '../context/ToastContext'
import { IconCalendar } from './icons/SidebarIcons'

export function CustomerLayout() {
  const { patient, logout } = useCustomerAuth()
  const toast = useToast()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 shrink-0 flex-col bg-gray-900 text-white shadow-lg">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <BrandLogo size="lg" className="ring-white/20" />
            <div>
              <p className="text-lg font-bold text-white">DentaFlow</p>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Patient Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <NavLink
            to="/book/appointments"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800/80 text-cyan-400">
              <IconCalendar className="h-[18px] w-[18px]" />
            </span>
            Appointments
          </NavLink>
        </nav>

        <div className="border-t border-white/10 p-4 text-center text-xs text-gray-500">
          <p className="mb-2 text-gray-300">{patient?.full_name}</p>
          <Link to="/" className="text-cyan-400 hover:underline">
            Clinic staff login
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-4 border-b bg-white px-6">
          <span className="text-sm text-gray-600">Hi, {patient?.first_name}</span>
          <button
            type="button"
            onClick={async () => {
              await logout()
              toast.success('Logged out.')
            }}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
