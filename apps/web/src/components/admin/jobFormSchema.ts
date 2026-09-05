import { z } from 'zod'

const optionalSalary = z.preprocess(
  (value) => (value === '' || (typeof value === 'number' && Number.isNaN(value)) ? undefined : value),
  z.number({ message: 'Enter a valid salary' }).int('Salary must be a whole number').nonnegative('Salary cannot be negative').optional(),
)

export const jobFormSchema = z.object({
  title: z.string().trim().min(2, 'Job title is required').max(200),
  company: z.string().trim().min(2, 'Company is required').max(200),
  location: z.string().trim().min(2, 'Location is required').max(200),
  categoryId: z.string().uuid('Category is required'),
  experienceLevelId: z.string().uuid('Experience level is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  salaryMin: optionalSalary,
  salaryMax: optionalSalary,
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(10000),
  requirements: z.string().trim().min(10, 'Requirements must be at least 10 characters').max(10000),
  benefits: z.string().trim().min(10, 'Benefits must be at least 10 characters').max(10000),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']),
}).refine(
  (value) => value.salaryMin === undefined || value.salaryMax === undefined || value.salaryMin <= value.salaryMax,
  { path: ['salaryMin'], message: 'Minimum salary must not exceed maximum salary' },
)

export type JobFormData = z.infer<typeof jobFormSchema>
export type JobFormInput = z.input<typeof jobFormSchema>
