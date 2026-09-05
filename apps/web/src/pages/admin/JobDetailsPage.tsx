import { useEffect } from 'react'
import { ArrowLeft, Pencil, RefreshCw } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchJobById } from '../../features/jobs/jobSlice'
import { selectCurrentJob, selectCurrentJobError, selectCurrentJobStatus } from '../../features/jobs/jobSelectors'
import type { Job } from '../../features/jobs/jobTypes'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

function formatSalary(job: Pick<Job, 'salaryMin' | 'salaryMax'>) {
  const { salaryMin, salaryMax } = job
  if (salaryMin == null && salaryMax == null) return 'Not specified'
  const format = (value: number) => value.toLocaleString('en-US')
  if (salaryMin != null && salaryMax != null) return `${format(salaryMin)} - ${format(salaryMax)}`
  if (salaryMin != null) return `From ${format(salaryMin)}`
  return `Up to ${format(salaryMax as number)}`
}

function statusClass(status: Job['status']) {
  return `jobs-status jobs-status-${status.toLowerCase()}`
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const currentJob = useAppSelector(selectCurrentJob)
  const currentJobStatus = useAppSelector(selectCurrentJobStatus)
  const currentJobError = useAppSelector(selectCurrentJobError)

  useEffect(() => {
    if (id) void dispatch(fetchJobById(id))
  }, [dispatch, id])

  if (!id) {
    return (
      <section className="jobs-message" role="alert">
        <RefreshCw size={22} />
        <div>
          <h2>Job could not be loaded</h2>
          <p>No job was specified.</p>
          <button type="button" onClick={() => navigate('/admin/jobs')}>Back to Jobs</button>
        </div>
      </section>
    )
  }

  if (currentJobStatus === 'loading' || currentJobStatus === 'idle') {
    return (
      <div className="jobs-loading" role="status" aria-label="Loading job details">
        {Array.from({ length: 4 }, (_, index) => <div className="jobs-loading-row" key={index} />)}
      </div>
    )
  }

  if (currentJobStatus === 'failed' || !currentJob || currentJob.id !== id) {
    return (
      <section className="jobs-message" role="alert">
        <RefreshCw size={22} />
        <div>
          <h2>Job could not be loaded</h2>
          <p>{currentJobError ?? 'This job could not be found or is no longer available.'}</p>
          <div className="job-details-error-actions">
            <button type="button" onClick={() => void dispatch(fetchJobById(id))}>Retry</button>
            <Link to="/admin/jobs" className="job-details-back-link">Back to Jobs</Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <div className="job-details-page">
      <div className="job-details-topbar">
        <Link to="/admin/jobs" className="job-details-back-link" aria-label="Back to Jobs">
          <ArrowLeft size={16} />
          <span>Back to Jobs</span>
        </Link>
        <Link to={`/admin/jobs/${currentJob.id}/edit`} className="jobs-create-link job-details-edit-link" aria-label={`Edit ${currentJob.title}`}>
          <Pencil size={15} />
          <span>Edit Job</span>
        </Link>
      </div>

      <section className="job-details-panel" aria-labelledby="job-details-title">
        <header className="job-details-header">
          <div>
            <p className="admin-header-kicker">{currentJob.companyName}</p>
            <h2 id="job-details-title">{currentJob.title}</h2>
          </div>
          <span className={statusClass(currentJob.status)}>{currentJob.status}</span>
        </header>

        <dl className="job-details-meta">
          <div>
            <dt>Location</dt>
            <dd>{currentJob.location}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{currentJob.category.name}</dd>
          </div>
          <div>
            <dt>Experience level</dt>
            <dd>{currentJob.experienceLevel.name}</dd>
          </div>
          <div>
            <dt>Employment type</dt>
            <dd>{currentJob.employmentType.replace('_', ' ')}</dd>
          </div>
          <div>
            <dt>Salary range</dt>
            <dd>{formatSalary(currentJob)}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(currentJob.createdAt)}</dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd>{formatDate(currentJob.updatedAt)}</dd>
          </div>
        </dl>

        <div className="job-details-sections">
          <section aria-labelledby="job-details-description-heading">
            <h3 id="job-details-description-heading">Description</h3>
            <p className="job-details-text">{currentJob.description}</p>
          </section>
          <section aria-labelledby="job-details-requirements-heading">
            <h3 id="job-details-requirements-heading">Requirements</h3>
            <p className="job-details-text">{currentJob.requirements}</p>
          </section>
          <section aria-labelledby="job-details-benefits-heading">
            <h3 id="job-details-benefits-heading">Benefits</h3>
            <p className="job-details-text">{currentJob.benefits}</p>
          </section>
        </div>
      </section>
    </div>
  )
}
