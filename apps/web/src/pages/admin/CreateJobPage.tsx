import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import JobForm from '../../components/admin/JobForm'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchJobs, createJob } from '../../features/jobs/jobSlice'
import {
  selectCreateJobError,
  selectCreateJobStatus,
  selectJobCategories,
  selectJobExperienceLevels,
  selectJobs,
  selectJobsStatus,
} from '../../features/jobs/jobSelectors'

export default function CreateJobPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const jobs = useAppSelector(selectJobs)
  const jobsStatus = useAppSelector(selectJobsStatus)
  const jobCategories = useAppSelector(selectJobCategories)
  const jobExperienceLevels = useAppSelector(selectJobExperienceLevels)
  const createStatus = useAppSelector(selectCreateJobStatus)
  const createError = useAppSelector(selectCreateJobError)

  useEffect(() => {
    if (jobs.length === 0 && jobsStatus === 'idle') void dispatch(fetchJobs())
  }, [dispatch, jobs.length, jobsStatus])

  const categories = useMemo(() => {
    return [...jobCategories].sort((a, b) => a.name.localeCompare(b.name))
  }, [jobCategories])

  const experienceLevels = useMemo(() => {
    return [...jobExperienceLevels].sort((a, b) => a.name.localeCompare(b.name))
  }, [jobExperienceLevels])

  return (
    <div className="create-job-page">
      <div className="create-job-intro">
        <div>
          <p className="admin-header-kicker">Management / Jobs</p>
          <h2>Create a job</h2>
          <p>Publish a clear opportunity for the right people to find.</p>
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
          submitting={createStatus === 'loading'}
          serverError={createError}
          onCancel={() => navigate('/admin/jobs')}
          onSubmit={async (payload) => {
            const result = await dispatch(createJob(payload))
            if (createJob.fulfilled.match(result)) {
              await dispatch(fetchJobs())
              navigate('/admin/jobs', { replace: true, state: { successMessage: 'Job created successfully.' } })
            }
          }}
        />
      )}
    </div>
  )
}