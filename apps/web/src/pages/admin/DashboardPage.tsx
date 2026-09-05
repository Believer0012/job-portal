import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowUpRight, BriefcaseBusiness, CheckCircle2, Clock3, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchDashboardStats } from '../../features/dashboard/dashboardSlice'
import {
  selectDashboardData,
  selectDashboardError,
  selectDashboardStatus,
} from '../../features/dashboard/dashboardSelectors'
import type { ApplicationStatus, JobStatus } from '../../features/dashboard/dashboardTypes'

const jobStatuses: Array<{ key: JobStatus; label: string }> = [
  { key: 'PUBLISHED', label: 'Published' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'CLOSED', label: 'Closed' },
]

const applicationStatuses: Array<{ key: ApplicationStatus; label: string }> = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'REVIEWING', label: 'Reviewing' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'REJECTED', label: 'Rejected' },
  { key: 'HIRED', label: 'Hired' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function statusClass(status: JobStatus) {
  return `dashboard-status dashboard-status-${status.toLowerCase()}`
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-loading" aria-label="Loading dashboard" role="status">
      <div className="dashboard-skeleton-heading" />
      <div className="dashboard-stat-grid">
        {Array.from({ length: 4 }, (_, index) => <div className="dashboard-skeleton-card" key={index} />)}
      </div>
      <div className="dashboard-skeleton-panel" />
    </div>
  )
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectDashboardData)
  const status = useAppSelector(selectDashboardStatus)
  const error = useAppSelector(selectDashboardError)

  useEffect(() => {
    void dispatch(fetchDashboardStats())
  }, [dispatch])

  if (status === 'loading' || status === 'idle') {
    return <DashboardSkeleton />
  }

  if (status === 'failed' || !data) {
    return (
      <section className="dashboard-error" role="alert">
        <AlertCircle size={22} />
        <div>
          <h2>Dashboard unavailable</h2>
          <p>{error ?? 'We could not load the latest dashboard data.'}</p>
          <button type="button" onClick={() => void dispatch(fetchDashboardStats())}>Retry</button>
        </div>
      </section>
    )
  }

  const maxApplicationCount = Math.max(...applicationStatuses.map(({ key }) => data.applicationStatusDistribution[key]), 1)
  const maxJobCount = Math.max(...jobStatuses.map(({ key }) => data.jobStatusDistribution[key]), 1)

  return (
    <div className="dashboard-page">
      <div className="dashboard-intro">
        <div>
          <p className="admin-header-kicker">Overview</p>
          <h2>Good morning, here&apos;s the pulse.</h2>
        </div>
        <p className="dashboard-updated">Live from your job portal</p>
      </div>

      <section className="dashboard-stat-grid" aria-label="Key statistics">
        <article className="dashboard-stat-card dashboard-stat-primary">
          <div className="dashboard-stat-icon"><BriefcaseBusiness size={19} /></div>
          <p>Total jobs</p>
          <strong>{data.totalJobs}</strong>
          <span>{data.closedJobs} closed</span>
        </article>
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><CheckCircle2 size={19} /></div>
          <p>Published jobs</p>
          <strong>{data.publishedJobs}</strong>
          <span>Currently live</span>
        </article>
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><Clock3 size={19} /></div>
          <p>Draft jobs</p>
          <strong>{data.draftJobs}</strong>
          <span>Awaiting review</span>
        </article>
        <article className="dashboard-stat-card">
          <div className="dashboard-stat-icon"><Users size={19} /></div>
          <p>Applications</p>
          <strong>{data.totalApplications}</strong>
          <span>{data.totalUsers} registered users</span>
        </article>
      </section>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel dashboard-recent-panel" aria-labelledby="recent-jobs-title">
          <div className="dashboard-panel-header">
            <div>
              <p className="admin-header-kicker">Activity</p>
              <h2 id="recent-jobs-title">Recent jobs</h2>
            </div>
            <Link to="/admin/jobs" className="dashboard-text-link">View all <ArrowUpRight size={15} /></Link>
          </div>
          {data.recentJobs.length === 0 ? (
            <div className="dashboard-empty">No jobs have been created yet.</div>
          ) : (
            <div className="dashboard-job-list">
              {data.recentJobs.map((job) => (
                <Link to={`/admin/jobs/${job.id}`} className="dashboard-job-row" key={job.id}>
                  <div className="dashboard-job-mark"><BriefcaseBusiness size={17} /></div>
                  <div className="dashboard-job-main">
                    <strong>{job.title}</strong>
                    <span>{job.company} · {job.category.name} · {job.experienceLevel.name}</span>
                  </div>
                  <span className={statusClass(job.status)}>{job.status}</span>
                  <time dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
                  <ArrowUpRight className="dashboard-row-arrow" size={16} />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel" aria-labelledby="job-status-title">
          <div className="dashboard-panel-header">
            <div>
              <p className="admin-header-kicker">Pipeline</p>
              <h2 id="job-status-title">Job status</h2>
            </div>
          </div>
          <div className="dashboard-bars">
            {jobStatuses.map(({ key, label }) => (
              <div className="dashboard-bar-item" key={key}>
                <div><span>{label}</span><strong>{data.jobStatusDistribution[key]}</strong></div>
                <div className="dashboard-bar-track"><span className={`dashboard-bar-fill dashboard-bar-${key.toLowerCase()}`} style={{ width: `${(data.jobStatusDistribution[key] / maxJobCount) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel dashboard-application-panel" aria-labelledby="application-status-title">
          <div className="dashboard-panel-header">
            <div>
              <p className="admin-header-kicker">Candidate flow</p>
              <h2 id="application-status-title">Application status</h2>
            </div>
          </div>
          <div className="dashboard-application-grid">
            {applicationStatuses.map(({ key, label }) => (
              <div className="dashboard-application-item" key={key}>
                <span className="dashboard-application-dot" />
                <div><span>{label}</span><strong>{data.applicationStatusDistribution[key]}</strong></div>
                <div className="dashboard-mini-track"><span style={{ width: `${(data.applicationStatusDistribution[key] / maxApplicationCount) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
