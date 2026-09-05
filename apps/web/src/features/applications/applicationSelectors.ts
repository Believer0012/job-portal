import type { RootState } from '../../app/store'

export const selectApplicationStatus = (state: RootState) => state.applications.status
export const selectApplicationError = (state: RootState) => state.applications.error
export const selectAppliedJobIds = (state: RootState) => state.applications.appliedJobIds
export const selectLastAttemptedJobId = (state: RootState) => state.applications.lastAttemptedJobId
