import type { RootState } from '../../app/store'

export const selectJobs = (state: RootState) => state.jobs.items
export const selectCurrentJob = (state: RootState) => state.jobs.currentJob
export const selectJobsPagination = (state: RootState) => state.jobs.pagination
export const selectJobsFilters = (state: RootState) => state.jobs.filters
export const selectJobsStatus = (state: RootState) => state.jobs.status
export const selectJobsError = (state: RootState) => state.jobs.error
export const selectCreateJobStatus = (state: RootState) => state.jobs.createStatus
export const selectCreateJobError = (state: RootState) => state.jobs.createError
export const selectCurrentJobStatus = (state: RootState) => state.jobs.currentJobStatus
export const selectCurrentJobError = (state: RootState) => state.jobs.currentJobError
export const selectUpdateJobStatus = (state: RootState) => state.jobs.updateStatus
export const selectUpdateJobError = (state: RootState) => state.jobs.updateError
export const selectDeleteJobStatus = (state: RootState) => state.jobs.deleteStatus
export const selectDeleteJobError = (state: RootState) => state.jobs.deleteError
export const selectDeletingJobId = (state: RootState) => state.jobs.deletingId
export const selectStatusUpdateStatus = (state: RootState) => state.jobs.statusUpdateStatus
export const selectStatusUpdateError = (state: RootState) => state.jobs.statusUpdateError
export const selectStatusUpdatingId = (state: RootState) => state.jobs.statusUpdatingId
export const selectJobCategories = (state: RootState) => state.jobs.categories
export const selectJobExperienceLevels = (state: RootState) => state.jobs.experienceLevels
