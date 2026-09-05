import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { store } from './app/store'
import { restoreSession } from './features/auth/authSlice'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import JobsPage from './pages/admin/JobsPage'
import CreateJobPage from './pages/admin/CreateJobPage'
import EditJobPage from './pages/admin/EditJobPage'
import JobDetailsPage from './pages/admin/JobDetailsPage'
import PublicLayout from './components/public/PublicLayout'
import LandingPage from './pages/public/LandingPage'
import PublicJobsPage from './pages/public/JobsPage'
import PublicJobDetailsPage from './pages/public/JobDetailsPage'
import './App.css'

store.dispatch(restoreSession())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<PublicJobsPage />} />
            <Route path="/jobs/:id" element={<PublicJobDetailsPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="jobs/create" element={<CreateJobPage />} />
              <Route path="jobs/:id" element={<JobDetailsPage />} />
              <Route path="jobs/:id/edit" element={<EditJobPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
