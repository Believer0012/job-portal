import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import jobsReducer from '../features/jobs/jobSlice'
import publicJobsReducer from '../features/publicJobs/publicJobsSlice'
import applicationsReducer from '../features/applications/applicationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    jobs: jobsReducer,
    publicJobs: publicJobsReducer,
    applications: applicationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
