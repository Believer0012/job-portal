import { useEffect, useMemo, useState } from 'react'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, RefreshCw, RotateCcw, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchPublicJobs } from '../../features/publicJobs/publicJobsSlice'
import {
  selectPublicJobCategories,
  selectPublicJobExperienceLevels,
  selectPublicJobs,
  selectPublicJobsError,
  selectPublicJobsPagination,
  selectPublicJobsStatus,
} from '../../features/publicJobs/publicJobSelectors'
import type { PublicJobFilters, PublicJobSortField } from '../../features/publicJobs/publicJobTypes'
import type { EmploymentType, SortOrder } from '../../features/jobs/jobTypes'
import { formatDate, formatSalaryRange } from '../../lib/format'

const employmentTypes: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']

function filtersFromSearchParams(params: URLSearchParams): PublicJobFilters {
  const employmentType = params.get('employmentType')
  const sortBy = params.get('sortBy')
  const sortOrder = params.get('sortOrder')
  const page = Number.parseInt(params.get('page') ?? '1', 10)
  const limit = Number.parseInt(params.get('limit') ?? '10', 10)

  return {
    search: params.get('search') ?? undefined,
    category: params.get('category') ?? undefined,
    experience: params.get('experience') ?? undefined,
    location: params.get('location') ?? undefined,
    employmentType: (employmentTypes as string[]).includes(employmentType ?? '') ? (employmentType as EmploymentType) : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? limit : 10,
    sortBy: (sortBy === 'title' || sortBy === 'companyName' || sortBy === 'createdAt') ? sortBy : 'createdAt',
    sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
  }
}

function paramsFromFilters(filters: PublicJobFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.experience) params.set('experience', filters.experience)
  if (filters.location) params.set('location', filters.location)
  if (filters.employmentType) params.set('employmentType', filters.employmentType)
  if (filters.page > 1) params.set('page', String(filters.page))
  if (filters.limit !== 10) params.set('limit', String(filters.limit))
  if (filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy)
  if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder)
  return params
}

function JobsLoading() {
  return (
    <div className="landing-cards-loading" role="status" aria-label="Loading jobs">
      {Array.from({ length: 6 }, (_, index) => <div className="job-card-skeleton" key={index} />)}
    </div>
  )
}

export default function JobsPage() {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const jobs = useAppSelector(selectPublicJobs)
  const jobCategories = useAppSelector(selectPublicJobCategories)
  const jobExperienceLevels = useAppSelector(selectPublicJobExperienceLevels)
  const pagination = useAppSelector(selectPublicJobsPagination)
  const status = useAppSelector(selectPublicJobsStatus)
  const error = useAppSelector(selectPublicJobsError)

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])
  const [searchInput, setSearchInput] = useState(filters.search ?? '')
  const [locationInput, setLocationInput] = useState(filters.location ?? '')

  useEffect(() => {
    void dispatch(fetchPublicJobs(filters))
  }, [dispatch, filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchInput === (filters.search ?? '') && locationInput === (filters.location ?? '')) return
      applyFilters({ search: searchInput || undefined, location: locationInput || undefined, page: 1 })
    }, 350)

    return () => window.clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput, locationInput])

  const categories = useMemo(() => {
    return Array.from(new Set(jobCategories.map((category) => category.name))).sort()
  }, [jobCategories])

  const experiences = useMemo(() => {
    return Array.from(new Set(jobExperienceLevels.map((level) => level.name))).sort()
  }, [jobExperienceLevels])

  function applyFilters(patch: Partial<PublicJobFilters>) {
    const next: PublicJobFilters = { ...filters, ...patch }
    setSearchParams(paramsFromFilters(next))
  }

  function resetFilters() {
    setSearchInput('')
    setLocationInput('')
    setSearchParams(new URLSearchParams())
  }

  function changePage(page: number) {
    if (page < 1 || page > pagination.totalPages || page === pagination.page) return
    applyFilters({ page })
  }

  const hasActiveFilters = Boolean(filters.search || filters.category || filters.experience || filters.employmentType || filters.location)

  return (
    <div className="public-jobs-page">
      <div className="public-page-intro">
        <p className="public-eyebrow">Opportunities</p>
        <h1>Browse jobs</h1>
        <p>Explore published roles across every category and experience level.</p>
      </div>

      <div className="public-controls">
        <label className="public-search">
          <span className="sr-only">Search jobs</span>
          <Search size={17} />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search jobs or companies"
          />
        </label>
        <input
          className="public-location-input"
          type="text"
          value={locationInput}
          onChange={(event) => setLocationInput(event.target.value)}
          placeholder="Location"
          aria-label="Location filter"
        />
        <select aria-label="Category filter" value={filters.category ?? ''} onChange={(event) => applyFilters({ category: event.target.value || undefined, page: 1 })}>
          <option value="">All categories</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select aria-label="Experience level filter" value={filters.experience ?? ''} onChange={(event) => applyFilters({ experience: event.target.value || undefined, page: 1 })}>
          <option value="">All experience levels</option>
          {experiences.map((experience) => <option key={experience} value={experience}>{experience}</option>)}
        </select>
        <select aria-label="Employment type filter" value={filters.employmentType ?? ''} onChange={(event) => applyFilters({ employmentType: (event.target.value || undefined) as EmploymentType | undefined, page: 1 })}>
          <option value="">All employment types</option>
          {employmentTypes.map((employmentType) => <option key={employmentType} value={employmentType}>{employmentType.replace('_', ' ')}</option>)}
        </select>
        <select aria-label="Sort jobs" value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(event) => {
          const [sortBy, sortOrder] = event.target.value.split(':') as [PublicJobSortField, SortOrder]
          applyFilters({ sortBy, sortOrder, page: 1 })
        }}>
          <option value="createdAt:desc">Newest</option>
          <option value="createdAt:asc">Oldest</option>
          <option value="title:asc">Title A-Z</option>
          <option value="title:desc">Title Z-A</option>
        </select>
        <button type="button" className="public-reset-button" onClick={resetFilters} title="Reset filters">
          <RotateCcw size={15} />
          <span>Clear</span>
        </button>
      </div>

      {status === 'loading' || status === 'idle' ? (
        <JobsLoading />
      ) : status === 'failed' ? (
        <div className="public-message" role="alert">
          <RefreshCw size={20} />
          <div>
            <p>{error ?? 'Something went wrong while loading jobs.'}</p>
            <button type="button" onClick={() => void dispatch(fetchPublicJobs(filters))}>Retry</button>
          </div>
        </div>
      ) : (
        <>
          <div className="public-results-heading">
            <strong>{pagination.total} jobs</strong>
            <span>{hasActiveFilters ? 'Filtered results' : 'All published opportunities'}</span>
          </div>

          {jobs.length === 0 ? (
            <div className="public-empty">
              <BriefcaseBusiness size={26} />
              <h3>{hasActiveFilters ? 'No jobs match your current filters.' : 'No jobs are published yet.'}</h3>
              <p>{hasActiveFilters ? 'Try adjusting or clearing your filters.' : 'Please check back soon for new opportunities.'}</p>
              {hasActiveFilters && <button type="button" onClick={resetFilters}>Clear filters</button>}
            </div>
          ) : (
            <div className="job-card-grid">
              {jobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="job-card-top">
                    <span className="job-card-mark"><BriefcaseBusiness size={16} /></span>
                    <span className="job-card-type">{job.employmentType.replace('_', ' ')}</span>
                  </div>
                  <h3><Link to={`/jobs/${job.id}`}>{job.title}</Link></h3>
                  <p className="job-card-company">{job.companyName} · {job.location}</p>
                  <p className="job-card-meta">{job.category.name} · {job.experienceLevel.name}</p>
                  <p className="job-card-salary">{formatSalaryRange(job.salaryMin, job.salaryMax)}</p>
                  <div className="job-card-footer">
                    <time dateTime={job.publishedAt ?? job.createdAt}>{formatDate(job.publishedAt ?? job.createdAt)}</time>
                    <Link to={`/jobs/${job.id}`} className="job-card-link">View Job</Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="public-pagination" aria-label="Jobs pagination">
              <button type="button" onClick={() => changePage(pagination.page - 1)} disabled={pagination.page === 1} aria-label="Previous page"><ChevronLeft size={17} /></button>
              <span>Page {pagination.page} of {pagination.totalPages}</span>
              <button type="button" onClick={() => changePage(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} aria-label="Next page"><ChevronRight size={17} /></button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
