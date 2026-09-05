import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronLeft,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { selectCurrentUser } from '../../features/auth/authSelectors'

const navigation = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: ChartNoAxesCombined, end: true },
  { label: 'Jobs', to: '/admin/jobs', icon: BriefcaseBusiness },
]

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/jobs': 'Jobs',
  '/admin/jobs/create': 'Create job',
}

export default function AdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector(selectCurrentUser)
  const [mobileOpen, setMobileOpen] = useState(false)

  const currentPage = pageTitles[location.pathname] ?? (location.pathname.includes('/jobs/') ? 'Job details' : 'Admin workspace')
  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD'

  async function handleLogout() {
    await dispatch(logout())
    navigate('/login', { replace: true })
  }

  function closeMobileNavigation() {
    setMobileOpen(false)
  }

  return (
    <div className="admin-shell">
      {mobileOpen && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={closeMobileNavigation} />}
      <aside className={`admin-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="admin-brand">
          <div className="admin-brand-mark"><ShieldCheck size={20} /></div>
          <div>
            <strong>Job Portal</strong>
            <span>Admin workspace</span>
          </div>
          <button className="admin-icon-button admin-mobile-close" type="button" onClick={closeMobileNavigation} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <p className="admin-nav-label">Workspace</p>
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="admin-nav-link" onClick={closeMobileNavigation}>
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="admin-logout-button" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Sign out</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header-start">
            <button className="admin-icon-button admin-mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={21} />
            </button>
            <div>
              <p className="admin-header-kicker">Admin workspace</p>
              <h1>{currentPage}</h1>
            </div>
          </div>
          <div className="admin-user">
            <div className="admin-user-avatar" aria-hidden="true">{initials}</div>
            <div className="admin-user-copy">
              <strong>{user?.name ?? 'Administrator'}</strong>
              <span>{user?.email ?? 'admin@jobportal.local'}</span>
            </div>
            <ChevronLeft className="admin-user-chevron" size={16} />
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
