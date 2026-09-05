import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { jobApi } from './jobApi'
import type { Job, JobFilters, JobPayload, JobsState, JobStatus } from './jobTypes'

function mergeOptions<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  if (incoming.length === 0) return existing
  const byId = new Map(existing.map((option) => [option.id, option]))
  for (const option of incoming) byId.set(option.id, option)
  return Array.from(byId.values())
}

function collectJobOptions(state: JobsState, jobs: Job[]) {
  state.categories = mergeOptions(state.categories, jobs.map((job) => job.category))
  state.experienceLevels = mergeOptions(state.experienceLevels, jobs.map((job) => job.experienceLevel))
}

const defaultFilters: JobFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

const initialState: JobsState = {
  items: [],
  currentJob: null,
  pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  filters: defaultFilters,
  status: 'idle',
  error: null,
  createStatus: 'idle',
  createError: null,
  currentJobStatus: 'idle',
  currentJobError: null,
  updateStatus: 'idle',
  updateError: null,
  deleteStatus: 'idle',
  deleteError: null,
  deletingId: null,
  statusUpdateStatus: 'idle',
  statusUpdateError: null,
  statusUpdatingId: null,
  categories: [],
  experienceLevels: [],
}

function getAccessToken(state: RootState) {
  const accessToken = state.auth.accessToken
  if (!accessToken) {
    throw new Error('Authentication is required to load jobs')
  }
  return accessToken
}

export const fetchJobs = createAsyncThunk<
  { items: Job[]; pagination: JobsState['pagination']; filters: JobFilters },
  JobFilters | undefined,
  { state: RootState }
>('jobs/fetchJobs', async (filters, { getState }) => {
  const nextFilters = filters ?? getState().jobs.filters
  const response = await jobApi.list(nextFilters, getAccessToken(getState()))
  return { items: response.data.items, pagination: response.data.pagination, filters: nextFilters }
})

export const fetchJobById = createAsyncThunk<Job, string, { state: RootState }>(
  'jobs/fetchJobById',
  async (id, { getState }) => {
    const response = await jobApi.getById(id, getAccessToken(getState()))
    return response.data.job
  },
)

export const createJob = createAsyncThunk<Job, JobPayload, { state: RootState }>(
  'jobs/createJob',
  async (payload, { getState }) => {
    const response = await jobApi.create(payload, getAccessToken(getState()))
    return response.data.job
  },
)

export const updateJob = createAsyncThunk<Job, { id: string; payload: JobPayload }, { state: RootState }>(
  'jobs/updateJob',
  async ({ id, payload }, { getState }) => {
    const response = await jobApi.update(id, payload, getAccessToken(getState()))
    return response.data.job
  },
)

export const deleteJob = createAsyncThunk<{ id: string }, string, { state: RootState }>(
  'jobs/deleteJob',
  async (id, { getState }) => {
    await jobApi.remove(id, getAccessToken(getState()))
    return { id }
  },
)

export const updateJobStatus = createAsyncThunk<Job, { id: string; status: JobStatus }, { state: RootState }>(
  'jobs/updateJobStatus',
  async ({ id, status }, { getState }) => {
    const response = await jobApi.updateStatus(id, { status }, getAccessToken(getState()))
    return response.data.job
  },
)

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.items = action.payload.items
        state.pagination = action.payload.pagination
        state.filters = action.payload.filters
        state.status = 'succeeded'
        state.error = null
        collectJobOptions(state, action.payload.items)
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unable to load jobs'
      })
      .addCase(fetchJobById.pending, (state) => {
        state.currentJobStatus = 'loading'
        state.currentJobError = null
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.currentJob = action.payload
        state.currentJobStatus = 'succeeded'
        state.currentJobError = null
        collectJobOptions(state, [action.payload])
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.currentJobStatus = 'failed'
        state.currentJobError = action.error.message ?? 'Unable to load job'
      })
      .addCase(createJob.pending, (state) => {
        state.createStatus = 'loading'
        state.createError = null
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.currentJob = action.payload
        state.createStatus = 'succeeded'
        state.createError = null
        collectJobOptions(state, [action.payload])
      })
      .addCase(createJob.rejected, (state, action) => {
        state.createStatus = 'failed'
        state.createError = action.error.message ?? 'Unable to create job'
      })
      .addCase(updateJob.pending, (state) => {
        state.updateStatus = 'loading'
        state.updateError = null
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.currentJob = action.payload
        state.updateStatus = 'succeeded'
        state.updateError = null
        collectJobOptions(state, [action.payload])
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.updateStatus = 'failed'
        state.updateError = action.error.message ?? 'Unable to update job'
      })
      .addCase(deleteJob.pending, (state, action) => {
        state.deleteStatus = 'loading'
        state.deleteError = null
        state.deletingId = action.meta.arg
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((job) => job.id !== action.payload.id)
        state.pagination = { ...state.pagination, total: Math.max(0, state.pagination.total - 1) }
        state.deleteStatus = 'succeeded'
        state.deleteError = null
        state.deletingId = null
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.deleteStatus = 'failed'
        state.deleteError = action.error.message ?? 'Unable to delete job'
      })
      .addCase(updateJobStatus.pending, (state, action) => {
        state.statusUpdateStatus = 'loading'
        state.statusUpdateError = null
        state.statusUpdatingId = action.meta.arg.id
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((job) => job.id === action.payload.id)
        if (index !== -1) state.items[index] = action.payload
        if (state.currentJob?.id === action.payload.id) state.currentJob = action.payload
        state.statusUpdateStatus = 'succeeded'
        state.statusUpdateError = null
        state.statusUpdatingId = null
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.statusUpdateStatus = 'failed'
        state.statusUpdateError = action.error.message ?? 'Unable to update job status'
      })
  },
})

export default jobsSlice.reducer
