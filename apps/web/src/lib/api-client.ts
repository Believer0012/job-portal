import type { ApiError, AuthResponse, MeResponse } from '../features/auth/authTypes'
import type { DashboardStatsResponse } from '../features/dashboard/dashboardTypes'
import type {
  JobDetailResponse,
  JobFilters,
  JobListResponse,
  JobPayload,
  JobStatusPayload,
} from '../features/jobs/jobTypes'
import type { PublicJobDetailResponse, PublicJobFilters, PublicJobListResponse } from '../features/publicJobs/publicJobTypes'
import type { ApplyResponse } from '../features/applications/applicationTypes'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export class ApiClientError extends Error {
  status: number
  details?: ApiError

  constructor(status: number, message: string, details?: ApiError) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.details = details
  }
}

async function request<T>(path: string, options: RequestInit = {}, accessToken?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiClientError(response.status, body?.message ?? 'Request failed', body ?? undefined)
  }

  return body as T
}

export const apiClient = {
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  refresh() {
    return request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  me(accessToken: string) {
    return request<MeResponse>('/auth/me', {}, accessToken)
  },

  logout() {
    return request<{ success: true }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  },

  getDashboardStats(accessToken: string) {
    return request<DashboardStatsResponse>('/admin/dashboard/stats', {}, accessToken)
  },

  getJobs(filters: JobFilters, accessToken: string) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    return request<JobListResponse>(`/admin/jobs?${params.toString()}`, {}, accessToken)
  },

  getJobById(id: string, accessToken: string) {
    return request<JobDetailResponse>(`/admin/jobs/${id}`, {}, accessToken)
  },

  createJob(payload: JobPayload, accessToken: string) {
    return request<JobDetailResponse>('/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, accessToken)
  },

  updateJob(id: string, payload: JobPayload, accessToken: string) {
    return request<JobDetailResponse>(`/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, accessToken)
  },

  deleteJob(id: string, accessToken: string) {
    return request<{ success: true; data: { message: string } }>(`/admin/jobs/${id}`, {
      method: 'DELETE',
    }, accessToken)
  },

  updateJobStatus(id: string, payload: JobStatusPayload, accessToken: string) {
    return request<JobDetailResponse>(`/admin/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }, accessToken)
  },

  getPublicJobs(filters: PublicJobFilters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.set(key, String(value))
    })
    return request<PublicJobListResponse>(`/jobs?${params.toString()}`)
  },

  getPublicJobById(id: string) {
    return request<PublicJobDetailResponse>(`/jobs/${id}`)
  },

  applyToJob(jobId: string, accessToken: string) {
    return request<ApplyResponse>(`/jobs/${jobId}/apply`, {
      method: 'POST',
    }, accessToken)
  },
}