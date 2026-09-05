export type UserRole = 'ADMIN' | 'USER'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  success: true
  data: {
    user: User
    accessToken: string
  }
}

export type MeResponse = {
  success: true
  data: {
    user: User
  }
}

export type ApiError = {
  success: false
  message: string
  errors?: Array<{ path?: Array<string | number>; message?: string }>
}

export type AuthState = {
  user: User | null
  accessToken: string | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'failed'
  error: string | null
}

export const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,
}
