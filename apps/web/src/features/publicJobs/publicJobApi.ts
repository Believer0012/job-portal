import { apiClient } from '../../lib/api-client'
import type { PublicJobFilters } from './publicJobTypes'

export const publicJobApi = {
  list(filters: PublicJobFilters) {
    return apiClient.getPublicJobs(filters)
  },

  getById(id: string) {
    return apiClient.getPublicJobById(id)
  },
}
