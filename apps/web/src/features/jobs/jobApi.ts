import { apiClient } from '../../lib/api-client'
import type { JobFilters, JobPayload, JobStatusPayload } from './jobTypes'

export const jobApi = {
  list(filters: JobFilters, accessToken: string) {
    return apiClient.getJobs(filters, accessToken)
  },

  getById(id: string, accessToken: string) {
    return apiClient.getJobById(id, accessToken)
  },

  create(payload: JobPayload, accessToken: string) {
    return apiClient.createJob(payload, accessToken)
  },

  update(id: string, payload: JobPayload, accessToken: string) {
    return apiClient.updateJob(id, payload, accessToken)
  },

  remove(id: string, accessToken: string) {
    return apiClient.deleteJob(id, accessToken)
  },

  updateStatus(id: string, payload: JobStatusPayload, accessToken: string) {
    return apiClient.updateJobStatus(id, payload, accessToken)
  },
}
