import { useEffect, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import JobForm from '../../components/admin/JobForm'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchJobById, fetchJobs, updateJob } from '../../features/jobs/jobSlice'
import {
  selectCurrentJob,
  selectCurrentJobError,
  selectCurrentJobStatus,
  selectJobCategories,
  selectJobExperienceLevels,
  selectJobs,
  selectJobsStatus,
  selectUpdateJobError,
  selectUpdateJobStatus,
} from '../../features/jobs/jobSelectors'
import type { JobPayload } from '../../features/jobs/jobTypes'

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const jobs = useAppSelector(selectJobs)
  const jobsStatus = useAppSelector(selectJobsStatus)
  const jobCategories = useAppSelector(selectJobCategories)
  const jobExperienceLevels = useAppSelector(selectJobExperienceLevels)
  const currentJob = useAppSelector(selectCurrentJob)
  const currentJobStatus = useAppSelector(selectCurrentJobStatus)
  const currentJobError = useAppSelector(selectCurrentJobError)
  const updateStatus = useAppSelector(selectUpdateJobStatus)
  const updateError = useAppSelector(selectUpdateJobError)

  useEffect(() => {
    if (id) void dispatch(fetchJobById(id))
  }, [dispatch, id])

  useEffect(() => {
    if (jobs.length === 0 && jobsStatus === 'idle') void dispatch(fetchJobs())
  }, [dispatch, jobs.length, jobsStatus])

  const categories = useMemo(() => {
    return [...jobCategories].sort((a, b) => a.name.localeCompare(b.name))
  }, [jobCategories])

  const experienceLevels = useMemo(() => {
    return [...jobExperienceLevels].sort((a, b) => a.name.localeCompare(b.name))
  }, [jobExperienceLevels])

  const initialValues = useMemo<JobPayload | null>(() => {
    if (!currentJob || currentJob.id !== id) return null
    return {
      title: currentJob.title,
      company: currentJob.companyName,
      location: currentJob.location,
      categoryId: currentJob.categoryId,
      experienceLevelId: currentJob.experienceLevelId,
      employmentType: currentJob.employmentType,
      salaryMin: currentJob.salaryMin ?? undefined,
      salaryMax: currentJob.salaryMax ?? undefined,
      description: currentJob.description,
      requirements: currentJob.requirements,
      benefits: currentJob.benefits,
      status: currentJob.status,
    }
  }, [currentJob, id])

  if (!id) {
    return (
      <section className="jobs-message jobs-error" role="alert">
        <RefreshCw size={22} />
        <div>
          <h2>Job could not be loaded</h2>
          <p>No job was specified.</p>
        </div>
      </section>
    )
  }

  if (currentJobStatus === 'loading' || currentJobStatus === 'idle') {
    return (
      <div className="job-form-options-empty" role="status">
        Loading job...
      </div>
    )
  }

  if (currentJobStatus === 'failed' || !initialValues) {
    return (
      <section className="jobs-message jobs-error" role="alert">
        <RefreshCw size={22} />
        <div>
          <h2>Job could not be loaded</h2>
          <p>{currentJobError ?? 'Something went wrong while loading this job.'}</p>
          <button type="button" onClick={() => void dispatch(fetchJobById(id))}>Retry</button>
        </div>
      </section>
    )
  }

  return (
    <div className="create-job-page">
      <div className="create-job-intro">
        <div>
          <p className="admin-header-kicker">Management / Jobs</p>
          <h2>Edit job</h2>
          <p>Update the details for this opportunity.</p>
        </div>
      </div>
      {categories.length === 0 || experienceLevels.length === 0 ? (
        <div className="job-form-options-empty" role="status">
          Loading category and experience options...
        </div>
      ) : (
        <JobForm
          categories={categories}
          experienceLevels={experienceLevels}
          submitting={updateStatus === 'loading'}
          serverError={updateError}
          initialValues={initialValues}
          submitLabel="Save changes"
          submittingLabel="Updating job..."
          onCancel={() => navigate('/admin/jobs')}
          onSubmit={async (payload) => {
            const result = await dispatch(updateJob({ id, payload }))
            if (updateJob.fulfilled.match(result)) {
              await dispatch(fetchJobs())
              navigate('/admin/jobs', { replace: true, state: { successMessage: 'Job updated successfully.' } })
            }
          }}
        />
      )}
    </div>
  )
}
