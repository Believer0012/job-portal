import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BriefcaseBusiness, RefreshCw, Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchFeaturedJobs } from '../../features/publicJobs/publicJobsSlice'
import { selectFeaturedJobs, selectFeaturedJobsError, selectFeaturedJobsStatus } from '../../features/publicJobs/publicJobSelectors'
import { formatDate, formatSalaryRange } from '../../lib/format'

const FEATURED_COUNT = 6

export default function LandingPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const jobs = useAppSelector(selectFeaturedJobs)
  const status = useAppSelector(selectFeaturedJobsStatus)
  const error = useAppSelector(selectFeaturedJobsError)
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchFeaturedJobs())
  }, [dispatch, status])

  const featuredJobs = useMemo(() => jobs.slice(0, FEATURED_COUNT), [jobs])

  const categories = useMemo(() => {
    return Array.from(new Map(jobs.map((job) => [job.category.name, job.category.name])).values()).sort()
  }, [jobs])

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.trim()) params.set('search', searchInput.trim())
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`)
  }

  function goToCategory(category: string) {
    navigate(`/jobs?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <p className="public-eyebrow">JOB PORTAL</p>
        <h1>Find work that fits your next chapter.</h1>
        <p className="landing-hero-copy">Search real, published opportunities from employers who are hiring right now.</p>
        <form className="landing-search" onSubmit={handleSearchSubmit} role="search">
          <Search size={18} />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by job title, company, or keyword"
            aria-label="Search jobs"
          />
          <button type="submit">Search Jobs</button>
        </form>
      </section>

      <section className="landing-section" aria-labelledby="featured-jobs-title">
        <div className="landing-section-heading">
          <h2 id="featured-jobs-title">Featured jobs</h2>
          <button type="button" className="public-text-link" onClick={() => navigate('/jobs')}>
            Browse all jobs <ArrowRight size={15} />
          </button>
        </div>

        {status === 'loading' || status === 'idle' ? (
          <div className="landing-cards-loading" role="status" aria-label="Loading featured jobs">
            {Array.from({ length: 3 }, (_, index) => <div className="job-card-skeleton" key={index} />)}
          </div>
        ) : status === 'failed' ? (
          <div className="public-message" role="alert">
            <RefreshCw size={20} />
            <div>
              <p>{error ?? 'We could not load featured jobs right now.'}</p>
              <button type="button" onClick={() => void dispatch(fetchFeaturedJobs())}>Retry</button>
            </div>
          </div>
        ) : featuredJobs.length === 0 ? (
          <div className="public-empty">
            <BriefcaseBusiness size={26} />
            <p>No published jobs are available yet. Check back soon.</p>
          </div>
        ) : (
          <div className="job-card-grid">
            {featuredJobs.map((job) => (
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
      </section>

      {categories.length > 0 && (
        <section className="landing-section" aria-labelledby="browse-category-title">
          <div className="landing-section-heading">
            <h2 id="browse-category-title">Browse by category</h2>
          </div>
          <div className="category-grid">
            {categories.map((category) => (
              <button type="button" className="category-card" key={category} onClick={() => goToCategory(category)}>
                {category}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
