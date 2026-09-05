import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import type { User } from './authTypes'
import { initialState } from './authTypes'

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }) => {
  const response = await authApi.login(credentials.email, credentials.password)
  return response.data
})

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
  const response = await authApi.refresh()
  return response.data
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authApi.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null
      state.accessToken = null
      state.status = 'unauthenticated'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.status = 'authenticated'
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Unable to sign in'
      })
      .addCase(restoreSession.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.status = 'authenticated'
      })
      .addCase(restoreSession.rejected, (state) => {
        state.status = 'unauthenticated'
        state.user = null
        state.accessToken = null
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.status = 'unauthenticated'
        state.error = null
      })
  },
})

export const { clearAuth } = authSlice.actions
export default authSlice.reducer
