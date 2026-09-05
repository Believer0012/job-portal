import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { BriefcaseBusiness, Menu, ShieldCheck, X } from 'lucide-react'

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="public-shell">
      <header className="public-header">
        <Link to="/" className="public-brand" onClick={() => setMobileOpen(false)}>
          <span className="public-brand-mark"><BriefcaseBusiness size={18} /></span>
          <span>Job Portal</span>
        </Link>
        <button
          type="button"
          className="public-nav-toggle"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <nav className={`public-nav ${mobileOpen ? 'is-open' : ''}`} aria-label="Public navigation">
          <NavLink to="/" end className="public-nav-link" onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink to="/jobs" className="public-nav-link" onClick={() => setMobileOpen(false)}>Browse Jobs</NavLink>
          <Link to="/login" className="public-nav-link public-nav-login" onClick={() => setMobileOpen(false)}>
            <ShieldCheck size={15} />
            <span>Login</span>
          </Link>
        </nav>
      </header>
      <main className="public-content">
        <Outlet />
      </main>
      <footer className="public-footer">
        <p>&copy; {new Date().getFullYear()} Job Portal. Find your next opportunity.</p>
      </footer>
    </div>
  )
}
