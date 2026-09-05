import type { RootState } from '../../app/store'

export const selectPublicJobs = (state: RootState) => state.publicJobs.items
export const selectPublicJobsPagination = (state: RootState) => state.publicJobs.pagination
export const selectPublicJobsFilters = (state: RootState) => state.publicJobs.filters
export const selectPublicJobsStatus = (state: RootState) => state.publicJobs.status
export const selectPublicJobsError = (state: RootState) => state.publicJobs.error
export const selectFeaturedJobs = (state: RootState) => state.publicJobs.featuredItems
export const selectFeaturedJobsStatus = (state: RootState) => state.publicJobs.featuredStatus
export const selectFeaturedJobsError = (state: RootState) => state.publicJobs.featuredError
export const selectPublicCurrentJob = (state: RootState) => state.publicJobs.currentJob
export const selectPublicCurrentJobStatus = (state: RootState) => state.publicJobs.currentJobStatus
export const selectPublicCurrentJobError = (state: RootState) => state.publicJobs.currentJobError
export const selectPublicJobCategories = (state: RootState) => state.publicJobs.categories
export const selectPublicJobExperienceLevels = (state: RootState) => state.publicJobs.experienceLevels
