import type { RootState } from '../../app/store'

export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectIsAuthenticated = (state: RootState) => state.auth.status === 'authenticated'
export const selectAuthStatus = (state: RootState) => state.auth.status
export const selectAuthError = (state: RootState) => state.auth.error
