import { apiClient } from '../../lib/api-client'

export const applicationApi = {
  apply(jobId: string, accessToken: string) {
    return apiClient.applyToJob(jobId, accessToken)
  },
}
