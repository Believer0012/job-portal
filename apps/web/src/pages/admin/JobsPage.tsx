import { useEffect, useMemo, useRef, useState } from 'react'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, ExternalLink, Loader2, Pencil, RefreshCw, RotateCcw, Search, Trash2 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { deleteJob, fetchJobs, updateJobStatus } from '../../features/jobs/jobSlice'
import {
  selectDeleteJobStatus,
  selectJobCategories,
  selectJobExperienceLevels,
  selectJobs,
  selectJobsError,
  selectJobsFilters,
  selectJobsPagination,
  selectJobsStatus,
  selectStatusUpdatingId,
  selectStatusUpdateStatus,
} from '../../features/jobs/jobSelectors'
import type { EmploymentType, Job, JobFilters, JobStatus, JobSortField, SortOrder } from '../../features/jobs/jobTypes'

const jobStatuses: JobStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED']
const employmentTypes: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function statusClass(status: JobStatus) {
  return `jobs-status jobs-status-${status.toLowerCase()}`
}

function JobsLoading() {
  return (
    <div className="jobs-loading" role="status" aria-label="Loading jobs">
      {Array.from({ length: 5 }, (_, index) => <div className="jobs-loading-row" key={index} />)}
    </div>
  )
}

export default function JobsPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const jobs = useAppSelector(selectJobs)
  const jobCategories = useAppSelector(selectJobCategories)
  const jobExperienceLevels = useAppSelector(selectJobExperienceLevels)
  const pagination = useAppSelector(selectJobsPagination)
  const filters = useAppSelector(selectJobsFilters)
  const status = useAppSelector(selectJobsStatus)
  const error = useAppSelector(selectJobsError)
  const deleteStatus = useAppSelector(selectDeleteJobStatus)
  const statusUpdateStatus = useAppSelector(selectStatusUpdateStatus)
  const statusUpdatingId = useAppSelector(selectStatusUpdatingId)
  const navigationSuccessMessage = (location.state as { successMessage?: string } | null)?.successMessage
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const [jobPendingDelete, setJobPendingDelete] = useState<Job | null>(null)
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchJobs())
  }, [dispatch, status])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput === (filters.search ?? '')) return
      void dispatch(fetchJobs({ ...filters, search: searchInput || undefined, page: 1 }))
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [dispatch, filters, searchInput])

  useEffect(() => {
    if (jobPendingDelete) cancelButtonRef.current?.focus()
  }, [jobPendingDelete])

  const categories = useMemo(() => {
    return Array.from(new Set(jobCategories.map((category) => category.name))).sort()
  }, [jobCategories])

  const experiences = useMemo(() => {
    return Array.from(new Set(jobExperienceLevels.map((level) => level.name))).sort()
  }, [jobExperienceLevels])

  function applyFilter<K extends keyof JobFilters>(key: K, value: JobFilters[K]) {
    void dispatch(fetchJobs({ ...filters, [key]: value || undefined, page: 1 }))
  }

  function applySort(sortBy: JobSortField, sortOrder: SortOrder) {
    void dispatch(fetchJobs({ ...filters, sortBy, sortOrder, page: 1 }))
  }

  function resetFilters() {
    const defaultFilters: JobFilters = {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }
    setSearchInput('')
    void dispatch(fetchJobs(defaultFilters))
  }

  function changePage(page: number) {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return
    void dispatch(fetchJobs({ ...filters, page }))
  }

  function requestDelete(job: Job) {
    setDeleteDialogError(null)
    setJobPendingDelete(job)
  }

  function cancelDelete() {
    if (deleteStatus === 'loading') return
    setJobPendingDelete(null)
    setDeleteDialogError(null)
  }

  async function confirmDelete() {
    if (!jobPendingDelete || deleteStatus === 'loading') return
    const target = jobPendingDelete
    const wasOnlyItemOnPage = jobs.length === 1 && filters.page > 1
    const result = await dispatch(deleteJob(target.id))
    if (deleteJob.fulfilled.match(result)) {
      setJobPendingDelete(null)
      setDeleteDialogError(null)
      setActionError(null)
      setActionMessage(`"${target.title}" was deleted successfully.`)
      const nextPage = wasOnlyItemOnPage ? filters.page - 1 : filters.page
      void dispatch(fetchJobs({ ...filters, page: nextPage }))
    } else {
      setDeleteDialogError(result.error.message ?? 'Unable to delete job. Please try again.')
    }
  }

  async function handleStatusChange(job: Job, nextStatus: JobStatus) {
    if (nextStatus === job.status || statusUpdatingId) return
    setActionMessage(null)
    setActionError(null)
    const result = await dispatch(updateJobStatus({ id: job.id, status: nextStatus }))
    if (updateJobStatus.fulfilled.match(result)) {
      setActionMessage(`Status for "${job.title}" changed to ${nextStatus}.`)
    } else {
      setActionError(`Could not update status for "${job.title}": ${result.error.message ?? 'Unable to update job status.'}`)
    }
  }

  if (status === 'loading' || status === 'idle') return <JobsLoading />

  if (status === 'failed') {
    return (
      <section className="jobs-message jobs-error" role="alert">
        <RefreshCw size={22} />
        <div>
          <h2>Jobs could not be loaded</h2>
          <p>{error ?? 'Something went wrong while loading jobs.'}</p>
          <button type="button" onClick={() => void dispatch(fetchJobs())}>Retry</button>
        </div>
      </section>
    )
  }

  const bannerMessage = actionMessage ?? navigationSuccessMessage
  const hasActiveFilters = Boolean(filters.search || filters.category || filters.experience || filters.status || filters.employmentType)

  return (
    <div className="jobs-page">
      <div className="jobs-page-intro">
        <div>
          <p className="admin-header-kicker">Management</p>
          <h2>Jobs</h2>
          <p>Review the opportunities currently in your portal.</p>
        </div>
        <Link className="jobs-create-link" to="/admin/jobs/create">Create job</Link>
      </div>

      <section className="jobs-panel" aria-label="Jobs list">
        {bannerMessage && <p className="jobs-success-message" role="status">{bannerMessage}</p>}
        {actionError && <p className="jobs-error-message" role="alert">{actionError}</p>}
        <div className="jobs-controls">
          <label className="jobs-search">
            <span className="sr-only">Search jobs</span>
            <Search size={17} />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search jobs or companies"
            />
          </label>
          <select aria-label="Category filter" value={filters.category ?? ''} onChange={(event) => applyFilter('category', event.target.value)}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select aria-label="Experience level filter" value={filters.experience ?? ''} onChange={(event) => applyFilter('experience', event.target.value)}>
            <option value="">All experience levels</option>
            {experiences.map((experience) => <option key={experience} value={experience}>{experience}</option>)}
          </select>
          <select aria-label="Status filter" value={filters.status ?? ''} onChange={(event) => applyFilter('status', (event.target.value || undefined) as JobStatus | undefined)}>
            <option value="">All statuses</option>
            {jobStatuses.map((jobStatus) => <option key={jobStatus} value={jobStatus}>{jobStatus}</option>)}
          </select>
          <select aria-label="Employment type filter" value={filters.employmentType ?? ''} onChange={(event) => applyFilter('employmentType', (event.target.value || undefined) as EmploymentType | undefined)}>
            <option value="">All employment types</option>
            {employmentTypes.map((employmentType) => <option key={employmentType} value={employmentType}>{employmentType.replace('_', ' ')}</option>)}
          </select>
          <select aria-label="Sort jobs" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(event) => {
            const [sortBy, sortOrder] = event.target.value.split(':') as [JobSortField, SortOrder]
            applySort(sortBy, sortOrder)
          }}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="title:asc">Title A-Z</option>
            <option value="title:desc">Title Z-A</option>
          </select>
          <button type="button" className="jobs-reset-button" onClick={resetFilters} title="Reset filters">
            <RotateCcw size={15} />
            <span>Clear</span>
          </button>
        </div>
        <div className="jobs-panel-heading">
          <div>
            <strong>{pagination.total} jobs</strong>
            <span>{hasActiveFilters ? 'Filtered results' : 'All opportunities'}</span>
          </div>
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
        </div>

        {jobs.length === 0 ? (
          <div className="jobs-empty">
            <BriefcaseBusiness size={28} />
            <h3>{hasActiveFilters ? 'No jobs match your current filters.' : 'No jobs found'}</h3>
            <p>{hasActiveFilters ? 'Try clearing one or more filters.' : 'There are no jobs available for this view yet.'}</p>
            {hasActiveFilters && <button type="button" onClick={resetFilters}>Clear filters</button>}
          </div>
        ) : (
          <div className="jobs-table-wrap">
            <div className="jobs-table jobs-table-header" aria-hidden="true">
              <span>Opportunity</span>
              <span>Location</span>
              <span>Type</span>
              <span>Status</span>
              <span>Created</span>
              <span />
            </div>
            {jobs.map((job) => {
              const isUpdatingStatus = statusUpdatingId === job.id && statusUpdateStatus === 'loading'
              return (
                <div className="jobs-table jobs-table-row" key={job.id}>
                  <div className="jobs-opportunity">
                    <div className="jobs-row-mark"><BriefcaseBusiness size={16} /></div>
                    <div>
                      <Link to={`/admin/jobs/${job.id}`} className="jobs-title">{job.title}</Link>
                      <span>{job.companyName} · {job.category.name}</span>
                    </div>
                  </div>
                  <span className="jobs-muted">{job.location}</span>
                  <span className="jobs-muted">{job.employmentType.replace('_', ' ')}</span>
                  <div className="jobs-status-cell">
                    <select
                      className={statusClass(job.status)}
                      value={job.status}
                      disabled={isUpdatingStatus}
                      aria-label={`Change status for ${job.title}`}
                      onChange={(event) => void handleStatusChange(job, event.target.value as JobStatus)}
                    >
                      {jobStatuses.map((jobStatus) => <option key={jobStatus} value={jobStatus}>{jobStatus}</option>)}
                    </select>
                    {isUpdatingStatus && <Loader2 className="jobs-status-spinner" size={13} aria-label="Updating status" />}
                  </div>
                  <time className="jobs-muted" dateTime={job.createdAt}>{formatDate(job.createdAt)}</time>
                  <div className="jobs-actions">
                    <Link to={`/admin/jobs/${job.id}`} aria-label={`View ${job.title}`} title="View job"><ExternalLink size={16} /></Link>
                    <Link to={`/admin/jobs/${job.id}/edit`} aria-label={`Edit ${job.title}`} title="Edit job"><Pencil size={16} /></Link>
                    <button type="button" className="jobs-delete-button" aria-label={`Delete ${job.title}`} title="Delete job" onClick={() => requestDelete(job)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="jobs-pagination" aria-label="Jobs pagination">
            <button type="button" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page === 1} aria-label="Previous page"><ChevronLeft size={17} /></button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <select aria-label="Jobs per page" value={filters.limit} onChange={(event) => void dispatch(fetchJobs({ ...filters, limit: Number(event.target.value), page: 1 }))}>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button type="button" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} aria-label="Next page"><ChevronRight size={17} /></button>
          </div>
        )}
      </section>

      {jobPendingDelete && (
        <div
          className="job-delete-overlay"
          role="presentation"
          onClick={cancelDelete}
          onKeyDown={(event) => {
            if (event.key === 'Escape') cancelDelete()
          }}
        >
          <div
            className="job-delete-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="job-delete-title"
            aria-describedby="job-delete-description"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="job-delete-title">Delete "{jobPendingDelete.title}"?</h2>
            <p id="job-delete-description">This action cannot be undone. This job will be permanently removed.</p>
            {deleteDialogError && <p className="job-delete-error" role="alert">{deleteDialogError}</p>}
            <div className="job-delete-actions">
              <button type="button" ref={cancelButtonRef} onClick={cancelDelete} disabled={deleteStatus === 'loading'}>
                Cancel
              </button>
              <button type="button" className="job-delete-confirm" onClick={() => void confirmDelete()} disabled={deleteStatus === 'loading'}>
                {deleteStatus === 'loading' ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
