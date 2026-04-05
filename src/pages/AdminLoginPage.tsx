import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AdminLoginFeedbackModal } from '@/components/admin/AdminLoginFeedbackModal'
import { useAppDispatch } from '@/store/hooks'
import { patchAuth } from '@/store/slices/authSlice'

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function loginValidationMessage(email: string, password: string): string | null {
  const e = email.trim()
  if (!e && !password) return 'Please enter your email address and password.'
  if (!e) return 'Please enter your email address.'
  if (!EMAIL_RX.test(e)) return 'Please enter a valid email address.'
  if (!password) return 'Please enter your password.'
  return null
}

type LoginFeedback = { kind: 'error'; message: string } | { kind: 'success' }

const AdminLoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const msg = loginValidationMessage(email, password)
    if (msg) {
      setFeedback({ kind: 'error', message: msg })
      return
    }
    setFeedback({ kind: 'success' })
  }

  const dismissError = () => setFeedback(null)

  const completeSignIn = () => {
    dispatch(patchAuth({ onboarded: true }))
    navigate('/dashboard/admin/overview', { replace: true })
    setFeedback(null)
  }

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="isolate absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-[#EEF1F7] via-[#FAFBFD] to-[#E2E8F3]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-15%,rgba(184,206,240,0.55),transparent_58%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_100%_100%,rgba(200,214,236,0.4),transparent_50%)]" />
          <div className="absolute -top-[22%] -right-[12%] h-[min(78vmin,560px)] w-[min(78vmin,560px)] rounded-full bg-[#6B93DB]/38 blur-[96px]" />
          <div className="absolute -top-[5%] right-[8%] h-[min(42vmin,320px)] w-[min(42vmin,320px)] rounded-full bg-[#1D61C1]/14 blur-[72px]" />
          <div className="absolute -bottom-[28%] -left-[18%] h-[min(72vmin,540px)] w-[min(72vmin,540px)] rounded-full bg-[#A8BEE3]/42 blur-[88px]" />
          <div className="absolute -bottom-[8%] left-[5%] h-[min(48vmin,380px)] w-[min(48vmin,380px)] rounded-full bg-[#8FA8D4]/22 blur-[80px]" />
          <div className="absolute top-[32%] -left-[20%] h-[min(55vmin,420px)] w-[min(55vmin,420px)] rounded-full bg-[#C5CBD8]/55 blur-[90px]" />
          <div className="absolute bottom-[12%] right-[12%] h-[min(44vmin,340px)] w-[min(44vmin,340px)] rounded-full bg-[#B4B9C5]/40 blur-[76px]" />
          <div className="absolute left-1/2 top-1/2 h-[min(90vmin,640px)] w-[min(90vmin,640px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D8DEE8]/35 blur-[110px]" />
        </div>
        <div className="absolute inset-0 bg-slate-950/10" />
      </div>

      <div className="relative z-10 w-full max-w-[520px] rounded-3xl bg-white px-10 py-12 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)] ring-1 ring-white/20 sm:px-12 sm:py-14">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-[#2B2F36] sm:text-[28px] sm:leading-tight">
          Sign In
        </h1>
        <p className="mt-3 text-center text-[15px] leading-relaxed text-[#6B7280] sm:text-base">
          Securely sign in to monitor, manage, and control platform operations.
        </p>

        <form className="mt-10 flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="admin-login-email" className="sr-only">
              Email address
            </label>
            <input
              id="admin-login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 text-lg leading-normal text-[#2B2F36] placeholder:text-[#9CA3AF] outline-none transition-[box-shadow,border-color] focus:border-[#1D61C1]/50 focus:ring-2 focus:ring-[#1D61C1]/25 sm:rounded-2xl sm:text-xl sm:py-4.5"
            />
          </div>
          <div>
            <label htmlFor="admin-login-password" className="sr-only">
              Password
            </label>
            <input
              id="admin-login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 text-lg leading-normal text-[#2B2F36] placeholder:text-[#9CA3AF] outline-none transition-[box-shadow,border-color] focus:border-[#1D61C1]/50 focus:ring-2 focus:ring-[#1D61C1]/25 sm:rounded-2xl sm:text-xl sm:py-4.5"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-[#1D61C1] py-4 text-base font-semibold text-white shadow-md shadow-[#1D61C1]/25 transition-[background-color,transform,box-shadow] hover:bg-[#1955AD] hover:shadow-lg hover:shadow-[#1D61C1]/30 active:scale-[0.99] sm:rounded-2xl sm:py-4.5"
          >
            Sign In
          </button>
        </form>
      </div>

      {feedback ? (
        <AdminLoginFeedbackModal
          open
          variant={feedback.kind === 'error' ? 'error' : 'success'}
          title={feedback.kind === 'error' ? 'Unable to sign in' : 'Signed in successfully'}
          description={
            feedback.kind === 'error'
              ? feedback.message
              : 'You can now access the admin dashboard to monitor and manage platform operations.'
          }
          primaryLabel={feedback.kind === 'error' ? 'Try again' : 'Continue to dashboard'}
          onPrimary={feedback.kind === 'error' ? dismissError : completeSignIn}
        />
      ) : null}
    </div>
  )
}

export default AdminLoginPage
