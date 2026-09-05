import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { login } from '../../features/auth/authSlice'
import { selectAuthError, selectAuthStatus } from '../../features/auth/authSelectors'

type LoginLocationState = {
  from?: string
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const status = useAppSelector(selectAuthStatus)
  const error = useAppSelector(selectAuthError)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    const result = await dispatch(login(data))
    if (!login.fulfilled.match(result)) return

    if (result.payload.user.role === 'ADMIN') {
      navigate('/admin', { replace: true })
      return
    }

    const returnTo = (location.state as LoginLocationState | null)?.from
    navigate(returnTo ?? '/', { replace: true })
  }

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <p className="eyebrow">JOB PORTAL / ADMIN</p>
        <h1>Make the next hire count.</h1>
        <p className="intro-copy">A focused workspace for shaping better opportunities and connecting people with work that matters.</p>
        <div className="signal-list" aria-label="Platform highlights">
          <span>Curate roles</span>
          <span>Review momentum</span>
          <span>Build trust</span>
        </div>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="panel-mark">JP</div>
        <p className="eyebrow">WELCOME BACK</p>
        <h2 id="login-title">Sign in to continue</h2>
        <p className="panel-copy">Sign in with your account to continue.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
          </label>
          {errors.email && <p id="email-error" className="form-error" role="alert">{errors.email.message}</p>}
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
          </label>
          {errors.password && <p id="password-error" className="form-error" role="alert">{errors.password.message}</p>}
          {error && <p className="form-error" role="alert" aria-live="polite">{error}</p>}
          <button type="submit" disabled={status === 'loading'} aria-disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  )
}