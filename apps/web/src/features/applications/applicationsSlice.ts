import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { applicationApi } from './applicationApi'
import type { ApplicationsState } from './applicationTypes'

const initialState: ApplicationsState = {
  status: 'idle',
  error: null,
  appliedJobIds: [],
  lastAttemptedJobId: null,
}

function getAccessToken(state: RootState) {
  const accessToken = state.auth.accessToken
  if (!accessToken) {
    throw new Error('You must be signed in to apply for a job')
  }
  return accessToken
}

export const applyToJob = createAsyncThunk<{ jobId: string }, string, { state: RootState }>(
  'applications/apply',
  async (jobId, { getState }) => {
    await applicationApi.apply(jobId, getAccessToken(getState()))
    return { jobId }
  },
)

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (state, action) => {
        state.status = 'loading'
        state.error = null
        state.lastAttemptedJobId = action.meta.arg
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        if (!state.appliedJobIds.includes(action.payload.jobId)) {
          state.appliedJobIds.push(action.payload.jobId)
        }
      })
      .addCase(applyToJob.rejected, (state, action) => {
        const message = action.error.message ?? 'Unable to submit your application'
        state.status = 'failed'
        state.error = message
        const jobId = action.meta.arg
        if (message.toLowerCase().includes('already applied') && !state.appliedJobIds.includes(jobId)) {
          state.appliedJobIds.push(jobId)
        }
      })
  },
})

export default applicationsSlice.reducer
