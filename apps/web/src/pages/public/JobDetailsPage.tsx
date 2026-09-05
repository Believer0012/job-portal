import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  selectAppliedJobIds,
  selectApplicationError,
  selectApplicationStatus,
  selectLastAttemptedJobId,
} from '../../features/applications/applicationSelectors'
import { applyToJob } from '../../features/applications/applicationsSlice'
import { selectCurrentUser } from '../../features/auth/authSelectors'
import { fetchPublicJobById } from '../../features/publicJobs/publicJobsSlice'
import { selectPublicCurrentJob, selectPublicCurrentJobError, selectPublicCurrentJobStatus } from '../../features/publicJobs/publicJobSelectors'
import { formatDate, formatSalaryRange } from '../../lib/format'

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const currentJob = useAppSelector(selectPublicCurrentJob)
  const currentJobStatus = useAppSelector(selectPublicCurrentJobStatus)
  const currentJobError = useAppSelector(selectPublicCurrentJobError)

  const user = useAppSelector(selectCurrentUser)
  const applicationStatus = useAppSelector(selectApplicationStatus)
  const applicationError = useAppSelector(selectApplicationError)
  const appliedJobIds = useAppSelector(selectAppliedJobIds)
  const lastAttemptedJobId = useAppSelector(selectLastAttemptedJobId)

  useEffect(() => {
    if (id) void dispatch(fetchPublicJobById(id))
  }, [dispatch, id])

  if (!id) {
    return (
      <section className="public-message" role="alert">
        <RefreshCw size={20} />
        <div>
          <p>No job was specified.</p>
          <button type="button" onClick={() => navigate('/jobs')}>Back to Jobs</button>
        </div>
      </section>
    )
  }

  if (currentJobStatus === 'loading' || currentJobStatus === 'idle') {
    return (
      <div className="landing-cards-loading" role="status" aria-label="Loading job details">
        <div className="job-card-skeleton job-card-skeleton-tall" />
      </div>
    )
  }

  if (currentJobStatus === 'failed' || !currentJob || currentJob.id !== id) {
    return (
      <section className="public-message" role="alert">
        <RefreshCw size={20} />
        <div>
          <p>{currentJobError ?? 'This job could not be found or is no longer available.'}</p>
          <div className="job-details-error-actions">
            <button type="button" onClick={() => void dispatch(fetchPublicJobById(id))}>Retry</button>
            <Link to="/jobs" className="public-text-link">Back to Jobs</Link>
          </div>
        </div>
      </section>
    )
  }

  const hasApplied = appliedJobIds.includes(id)
  const isThisJob = lastAttemptedJobId === id
  const isSubmitting = isThisJob && applicationStatus === 'loading'
  const succeededJustNow = isThisJob && applicationStatus === 'succeeded' && hasApplied
  const duplicateMessage = isThisJob && applicationStatus === 'failed' && hasApplied ? applicationError : null
  const genericError = isThisJob && applicationStatus === 'failed' && !hasApplied ? applicationError : null

  function handleApplyClick() {
    if (!id) return
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } })
      return
    }
    if (user.role !== 'USER' || isSubmitting || hasApplied) return
    void dispatch(applyToJob(id))
  }

  return (
    <div className="public-job-details-page">
      <Link to="/jobs" className="public-text-link public-back-link">
        <ArrowLeft size={16} />
        <span>Back to Jobs</span>
      </Link>

      <section className="job-details-panel" aria-labelledby="public-job-title">
        <header className="job-details-header">
          <div>
            <p className="admin-header-kicker">{currentJob.companyName}</p>
            <h1 id="public-job-title">{currentJob.title}</h1>
          </div>

          {user?.role === 'ADMIN' ? (
            <span className="public-apply-note-badge">Applications are available for user accounts.</span>
          ) : hasApplied ? (
            <button type="button" className="public-apply-button public-apply-button-done" disabled>
              Applied
            </button>
          ) : (
            <button type="button" className="public-apply-button" onClick={handleApplyClick} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Apply Now'}
            </button>
          )}
        </header>

        {!user && <p className="public-apply-note">Sign in to apply for this job.</p>}
        {succeededJustNow && <p className="public-apply-success" role="status">Application submitted successfully.</p>}
        {duplicateMessage && <p className="public-apply-note" role="status">{duplicateMessage}</p>}
        {genericError && <p className="public-apply-error" role="alert">{genericError}</p>}

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
            <dd>{formatSalaryRange(currentJob.salaryMin, currentJob.salaryMax)}</dd>
          </div>
          <div>
            <dt>Published</dt>
            <dd>{formatDate(currentJob.publishedAt ?? currentJob.createdAt)}</dd>
          </div>
        </dl>

        <div className="job-details-sections">
          <section aria-labelledby="public-job-description-heading">
            <h2 id="public-job-description-heading">Description</h2>
            <p className="job-details-text">{currentJob.description}</p>
          </section>
          <section aria-labelledby="public-job-requirements-heading">
            <h2 id="public-job-requirements-heading">Requirements</h2>
            <p className="job-details-text">{currentJob.requirements}</p>
          </section>
          <section aria-labelledby="public-job-benefits-heading">
            <h2 id="public-job-benefits-heading">Benefits</h2>
            <p className="job-details-text">{currentJob.benefits}</p>
          </section>
        </div>
      </section>
    </div>
  )
}
