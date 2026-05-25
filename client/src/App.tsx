import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CustomerLayout } from './components/CustomerLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import { ConfirmProvider } from './context/ConfirmContext'
import { ToastProvider } from './context/ToastContext'
import { Login } from './pages/Login'

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Genders = lazy(() => import('./pages/Genders').then((m) => ({ default: m.Genders })))
const Users = lazy(() => import('./pages/Users').then((m) => ({ default: m.Users })))
const Dentists = lazy(() => import('./pages/Dentists').then((m) => ({ default: m.Dentists })))
const Staff = lazy(() => import('./pages/Staff').then((m) => ({ default: m.Staff })))
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })))
const Appointments = lazy(() =>
  import('./pages/Appointments').then((m) => ({ default: m.Appointments })),
)
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })))
const ActivityLogs = lazy(() =>
  import('./pages/ActivityLogs').then((m) => ({ default: m.ActivityLogs })),
)
const CustomerRegister = lazy(() =>
  import('./pages/book/CustomerRegister').then((m) => ({ default: m.CustomerRegister })),
)
const CustomerAppointments = lazy(() =>
  import('./pages/book/CustomerAppointments').then((m) => ({ default: m.CustomerAppointments })),
)

function PageLoader() {
  return (
    <div className="flex min-h-[200px] items-center justify-center text-gray-500">Loading...</div>
  )
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  if (user.role === 'user') return <Navigate to="/book/appointments" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  if (user.role === 'user') return <Navigate to="/book/appointments" replace />
  return <>{children}</>
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, patient, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }
  if (!user || user.role !== 'user' || !patient) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/book/login" element={<Navigate to="/" replace />} />
      <Route
        path="/book/register"
        element={
          <CustomerAuthProvider>
            <Suspense fallback={<PageLoader />}>
              <CustomerRegister />
            </Suspense>
          </CustomerAuthProvider>
        }
      />
      <Route
        path="/book"
        element={
          <UserRoute>
            <CustomerLayout />
          </UserRoute>
        }
      >
        <Route index element={<Navigate to="/book/appointments" replace />} />
        <Route
          path="appointments"
          element={
            <Suspense fallback={<PageLoader />}>
              <CustomerAppointments />
            </Suspense>
          }
        />
      </Route>

      <Route
        element={
          <StaffRoute>
            <Layout />
          </StaffRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/genders"
          element={
            <Suspense fallback={<PageLoader />}>
              <Genders />
            </Suspense>
          }
        />
        <Route
          path="/users"
          element={
            <Suspense fallback={<PageLoader />}>
              <Users />
            </Suspense>
          }
        />
        <Route
          path="/doctors"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dentists />
            </Suspense>
          }
        />
        <Route
          path="/dentists"
          element={
            <Suspense fallback={<PageLoader />}>
              <Dentists />
            </Suspense>
          }
        />
        <Route
          path="/services"
          element={
            <Suspense fallback={<PageLoader />}>
              <Services />
            </Suspense>
          }
        />
        <Route
          path="/staff"
          element={
            <Suspense fallback={<PageLoader />}>
              <Staff />
            </Suspense>
          }
        />
        <Route
          path="/appointments"
          element={
            <Suspense fallback={<PageLoader />}>
              <Appointments />
            </Suspense>
          }
        />
        <Route
          path="/reports"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <Reports />
              </Suspense>
            </AdminRoute>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <AdminRoute>
              <Suspense fallback={<PageLoader />}>
                <ActivityLogs />
              </Suspense>
            </AdminRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <CustomerAuthProvider>
            <AppRoutes />
          </CustomerAuthProvider>
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  )
}
