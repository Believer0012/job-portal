import { apiClient } from '../../lib/api-client'

export const authApi = {
  login: apiClient.login,
  refresh: apiClient.refresh,
  me: apiClient.me,
  logout: apiClient.logout,
}