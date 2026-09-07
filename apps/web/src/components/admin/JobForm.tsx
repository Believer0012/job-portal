import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { Category, EmploymentType, ExperienceLevel, JobPayload, JobStatus } from '../../features/jobs/jobTypes'
import { jobFormSchema, type JobFormData, type JobFormInput } from './jobFormSchema'

type JobFormProps = {
  categories: Category[]
  experienceLevels: ExperienceLevel[]
  onSubmit: (data: JobPayload) => void | Promise<void>
  onCancel: () => void
  submitting: boolean
  serverError: string | null
  initialValues?: JobPayload
  submitLabel?: string
  submittingLabel?: string
}

const employmentTypes: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']
const statuses: JobStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED']

export default function JobForm({
  categories,
  experienceLevels,
  onSubmit,
  onCancel,
  submitting,
  serverError,
  initialValues,
  submitLabel = 'Create job',
  submittingLabel = 'Creating job...',
}: JobFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormInput, unknown, JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: initialValues ?? { employmentType: 'FULL_TIME', status: 'DRAFT' },
  })

  useEffect(() => {
    if (initialValues) reset(initialValues)
  }, [initialValues, reset])

  const fieldError = (name: keyof JobFormData) => errors[name]?.message

  return (
    <form className="job-form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
      <p className="job-form-legend"><span className="job-form-required" aria-hidden="true">*</span> Required field</p>
      <div className="job-form-grid">
        <label className="job-form-field job-form-field-wide">
          <span className="job-form-label-text">Job title<span className="job-form-required" aria-hidden="true">*</span></span>
          <input required {...register('title')} aria-invalid={Boolean(errors.title)} aria-required="true" />
          {fieldError('title') && <span className="job-form-error">{fieldError('title')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Company<span className="job-form-required" aria-hidden="true">*</span></span>
          <input required {...register('company')} aria-invalid={Boolean(errors.company)} aria-required="true" />
          {fieldError('company') && <span className="job-form-error">{fieldError('company')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Location<span className="job-form-required" aria-hidden="true">*</span></span>
          <input required {...register('location')} aria-invalid={Boolean(errors.location)} aria-required="true" />
          {fieldError('location') && <span className="job-form-error">{fieldError('location')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Category<span className="job-form-required" aria-hidden="true">*</span></span>
          <select required {...register('categoryId')} aria-invalid={Boolean(errors.categoryId)} aria-required="true">
            <option value="">Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          {fieldError('categoryId') && <span className="job-form-error">{fieldError('categoryId')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Experience level<span className="job-form-required" aria-hidden="true">*</span></span>
          <select required {...register('experienceLevelId')} aria-invalid={Boolean(errors.experienceLevelId)} aria-required="true">
            <option value="">Select experience level</option>
            {experienceLevels.map((level) => <option key={level.id} value={level.id}>{level.name}</option>)}
          </select>
          {fieldError('experienceLevelId') && <span className="job-form-error">{fieldError('experienceLevelId')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Employment type</span>
          <select {...register('employmentType')}>
            {employmentTypes.map((type) => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Salary minimum</span>
          <input type="number" min="0" step="1" {...register('salaryMin', { valueAsNumber: true })} aria-invalid={Boolean(errors.salaryMin)} />
          {fieldError('salaryMin') && <span className="job-form-error">{fieldError('salaryMin')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Salary maximum</span>
          <input type="number" min="0" step="1" {...register('salaryMax', { valueAsNumber: true })} aria-invalid={Boolean(errors.salaryMax)} />
          {fieldError('salaryMax') && <span className="job-form-error">{fieldError('salaryMax')}</span>}
        </label>
        <label className="job-form-field job-form-field-wide">
          <span className="job-form-label-text">Description<span className="job-form-required" aria-hidden="true">*</span></span>
          <textarea required rows={5} {...register('description')} aria-invalid={Boolean(errors.description)} aria-required="true" />
          {fieldError('description') && <span className="job-form-error">{fieldError('description')}</span>}
        </label>
        <label className="job-form-field job-form-field-wide">
          <span className="job-form-label-text">Requirements<span className="job-form-required" aria-hidden="true">*</span></span>
          <textarea required rows={4} {...register('requirements')} aria-invalid={Boolean(errors.requirements)} aria-required="true" />
          {fieldError('requirements') && <span className="job-form-error">{fieldError('requirements')}</span>}
        </label>
        <label className="job-form-field job-form-field-wide">
          <span className="job-form-label-text">Benefits<span className="job-form-required" aria-hidden="true">*</span></span>
          <textarea required rows={4} {...register('benefits')} aria-invalid={Boolean(errors.benefits)} aria-required="true" />
          {fieldError('benefits') && <span className="job-form-error">{fieldError('benefits')}</span>}
        </label>
        <label className="job-form-field">
          <span className="job-form-label-text">Status</span>
          <select {...register('status')}>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
      </div>
      {serverError && <p className="job-form-server-error" role="alert">{serverError}</p>}
      <div className="job-form-actions">
        <button className="job-form-cancel" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="job-form-submit" type="submit" disabled={submitting} aria-disabled={submitting}>
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  )
}
