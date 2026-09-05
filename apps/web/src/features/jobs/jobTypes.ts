export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'FREELANCE'
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'
export type JobSortField = 'createdAt' | 'updatedAt' | 'title' | 'companyName' | 'status'
export type SortOrder = 'asc' | 'desc'

export type Category = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type ExperienceLevel = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type JobAuthor = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
}

export type Job = {
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
  closedAt: string | null
  categoryId: string
  experienceLevelId: string
  authorId: string
  createdAt: string
  updatedAt: string
  category: Category
  experienceLevel: ExperienceLevel
  author: JobAuthor
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type JobFilters = {
  search?: string
  category?: string
  experience?: string
  status?: JobStatus
  employmentType?: EmploymentType
  page: number
  limit: number
  sortBy: JobSortField
  sortOrder: SortOrder
}

export type JobListResponse = {
  success: true
  data: {
    items: Job[]
    pagination: Pagination
  }
}

export type JobDetailResponse = {
  success: true
  data: {
    job: Job
  }
}

export type JobPayload = {
  title: string
  company: string
  location: string
  categoryId: string
  experienceLevelId: string
  employmentType: EmploymentType
  salaryMin?: number
  salaryMax?: number
  description: string
  requirements: string
  benefits: string
  status: JobStatus
}

export type JobStatusPayload = {
  status: JobStatus
}

export type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type JobsState = {
  items: Job[]
  currentJob: Job | null
  pagination: Pagination
  filters: JobFilters
  status: AsyncStatus
  error: string | null
  categories: Category[]
  experienceLevels: ExperienceLevel[]
  createStatus: AsyncStatus
  createError: string | null
  currentJobStatus: AsyncStatus
  currentJobError: string | null
  updateStatus: AsyncStatus
  updateError: string | null
  deleteStatus: AsyncStatus
  deleteError: string | null
  deletingId: string | null
  statusUpdateStatus: AsyncStatus
  statusUpdateError: string | null
  statusUpdatingId: string | null
}
