import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { publicJobApi } from './publicJobApi'
import type { PublicJob, PublicJobFilters, PublicJobsState } from './publicJobTypes'

function mergeOptions<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return existing
  const byId = new Map(existing.map((option) => [option.id, option]))
  for (const option of incoming) byId.set(option.id, option)
  return Array.from(byId.values())
}

function collectJobOptions(state: PublicJobsState, jobs: PublicJob[]) {
  state.categories = mergeOptions(state.categories, jobs.map((job) => job.category))
  state.experienceLevels = mergeOptions(state.experienceLevels, jobs.map((job) => job.experienceLevel))
}

const defaultFilters: PublicJobFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

const initialState: PublicJobsState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: defaultFilters,
  status: 'idle',
  error: null,
  featuredItems: [],
  featuredStatus: 'idle',
  featuredError: null,
  currentJob: null,
  currentJobStatus: 'idle',
  currentJobError: null,
  categories: [],
  experienceLevels: [],
}

export const fetchPublicJobs = createAsyncThunk<
  { items: PublicJob[]; pagination: PublicJobsState['pagination']; filters: PublicJobFilters },
  PublicJobFilters | undefined,
  { state: RootState }
>('publicJobs/fetchJobs', async (filters, { getState }) => {
  const nextFilters = filters ?? getState().publicJobs.filters
  const response = await publicJobApi.list(nextFilters)
  return { items: response.data.items, pagination: response.data.pagination, filters: nextFilters }
})

export const fetchFeaturedJobs = createAsyncThunk<PublicJob[], void>('publicJobs/fetchFeatured', async () => {
  const response = await publicJobApi.list({ page: 1, limit: 24, sortBy: 'createdAt', sortOrder: 'desc' })
  return response.data.items
})

export const fetchPublicJobById = createAsyncThunk<PublicJob, string>('publicJobs/fetchJobById', async (id) => {
  const response = await publicJobApi.getById(id)
  return response.data.job
})

const publicJobsSlice = createSlice({
  name: 'publicJobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPublicJobs.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
        state.status = 'succeeded'
        state.error = null
        collectJobOptions(state, action.payload.items)
      })
      .addCase(fetchPublicJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unable to load jobs'
      })
      .addCase(fetchFeaturedJobs.pending, (state) => {
        state.featuredStatus = 'loading'
        state.featuredError = null
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action) => {
        state.featuredItems = action.payload
        state.featuredStatus = 'succeeded'
        state.featuredError = null
        collectJobOptions(state, action.payload)
      })
      .addCase(fetchFeaturedJobs.rejected, (state, action) => {
        state.featuredStatus = 'failed'
        state.featuredError = action.error.message ?? 'Unable to load featured jobs'
      })
      .addCase(fetchPublicJobById.pending, (state) => {
        state.currentJobStatus = 'loading'
        state.currentJobError = null
      })
      .addCase(fetchPublicJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload
        state.currentJobStatus = 'succeeded'
        state.currentJobError = null
        collectJobOptions(state, [action.payload])
      })
      .addCase(fetchPublicJobById.rejected, (state, action) => {
        state.currentJobStatus = 'failed'
        state.currentJobError = action.error.message ?? 'Unable to load job'
      })
  },
})

export default publicJobsSlice.reducer
