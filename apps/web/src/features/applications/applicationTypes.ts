import type { AsyncStatus } from '../jobs/jobTypes'

export type ApplicationStatus = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'REJECTED' | 'HIRED'

export type Application = {
  id: string
  userId: string
  jobId: string
  status: ApplicationStatus
  coverLetter: string | null
  resumeUrl: string | null
  createdAt: string
  updatedAt: string
}

export type ApplyResponse = {
  success: true
  data: {
    application: Application
  }
}

export type ApplicationsState = {
  status: AsyncStatus
  error: string | null
  appliedJobIds: string[]
  lastAttemptedJobId: string | null
}
