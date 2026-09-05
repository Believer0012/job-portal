import { apiClient } from '../../lib/api-client'

export const dashboardApi = {
  getStats(accessToken: string) {
    return apiClient.getDashboardStats(accessToken)
  },
}
