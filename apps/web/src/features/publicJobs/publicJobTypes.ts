import type { AsyncStatus, Category, EmploymentType, ExperienceLevel, JobStatus, Pagination, SortOrder } from '../jobs/jobTypes'

export type PublicJobSortField = 'createdAt' | 'title' | 'companyName'

export type PublicJob = {
  id: string
  slug: string
  title: string
  description: string
  requirements: string
  benefits: string
  companyName: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  employmentType: EmploymentType
  status: JobStatus
  publishedAt: string | null
  categoryId: string
  experienceLevelId: string
  createdAt: string
  updatedAt: string
  category: Category
  experienceLevel: ExperienceLevel
}

export type PublicJobFilters = {
  search?: string
  category?: string
  experience?: string
  employmentType?: EmploymentType
  location?: string
  page: number
  limit: number
  sortBy: PublicJobSortField
  sortOrder: SortOrder
}

export type PublicJobListResponse = {
  success: true
  data: {
    items: PublicJob[]
    pagination: Pagination
  }
}

export type PublicJobDetailResponse = {
  success: true
  data: {
    job: PublicJob
  }
}

export type PublicJobsState = {
  items: PublicJob[]
  pagination: Pagination
  filters: PublicJobFilters
  status: AsyncStatus
  error: string | null
  categories: Category[]
  experienceLevels: ExperienceLevel[]
  featuredItems: PublicJob[]
  featuredStatus: AsyncStatus
  featuredError: string | null
  currentJob: PublicJob | null
  currentJobStatus: AsyncStatus
  currentJobError: string | null
}
