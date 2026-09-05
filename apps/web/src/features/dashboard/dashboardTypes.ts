export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED'

export type ApplicationStatus =
  | 'APPLIED'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'REJECTED'
  | 'HIRED'

export type DashboardJob = {
  id: string
  title: string
  company: string
  status: JobStatus
  createdAt: string
  category: { name: string }
  experienceLevel: { name: string }
}

export type DashboardData = {
  totalJobs: number
  publishedJobs: number
  draftJobs: number
  closedJobs: number
  totalApplications: number
  totalUsers: number
  recentJobs: DashboardJob[]
  jobStatusDistribution: Record<JobStatus, number>
  applicationStatusDistribution: Record<ApplicationStatus, number>
}

export type DashboardStatsResponse = {
  success: true
  data: DashboardData
}

export type DashboardState = {
  data: DashboardData | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
