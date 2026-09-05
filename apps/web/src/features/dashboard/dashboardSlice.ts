import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { dashboardApi } from './dashboardApi'
import type { DashboardData, DashboardState } from './dashboardTypes'

const initialState: DashboardState = {
  data: null,
  status: 'idle',
  error: null,
}

export const fetchDashboardStats = createAsyncThunk<DashboardData, void, { state: RootState }>(
  'dashboard/fetchStats',
  async (_, { getState }) => {
    const accessToken = getState().auth.accessToken

    if (!accessToken) {
      throw new Error('Authentication is required to load the dashboard')
    }

    const response = await dashboardApi.getStats(accessToken)
    return response.data
  },
)

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.data = action.payload
        state.status = 'succeeded'
        state.error = null
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unable to load dashboard statistics'
      })
  },
})

export default dashboardSlice.reducer
