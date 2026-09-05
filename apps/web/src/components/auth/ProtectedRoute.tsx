import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectAuthStatus, selectCurrentUser } from '../../features/auth/authSelectors'

export default function ProtectedRoute() {
  const status = useAppSelector(selectAuthStatus)
  const user = useAppSelector(selectCurrentUser)

  if (status === 'loading' || status === 'idle') {
    return <div className="route-loading">Restoring your session...</div>
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
