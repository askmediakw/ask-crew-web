'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Lock, Mail, LogIn, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { setAuthToken, setAuthUser } from '@/lib/auth'
import { useApi } from '@/lib/api'

const DENIED_MESSAGE =
  'عفواً.. تم رفض الوصول. تحقق من البريد الإلكتروني وكلمة المرور.'

const GRANTED_MESSAGE = 'تم التحقق بنجاح.. جاري تشفير الاتصال ونقلك للوحة القيادة.'

export function LoginForm() {
  const router = useRouter()
  const { request } = useApi()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'denied' | 'granted'>('idle')
  const [errorMessage, setErrorMessage] = useState(DENIED_MESSAGE)

  type LoginResponse = {
    tokens?: { access?: string }
    token?: string
    access_token?: string
    message?: string
    user?: unknown
  }

  async function handleAdminLogin(e: FormEvent) {
    e.preventDefault()
    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)
    console.log('Password:', password)

    try {
      setIsLoading(true)
      const response = await request<LoginResponse>('/auth/login', 'POST', { email, password })
      console.log('✅ Login API response:', response)
      setStatus('granted')
      // Check what token field is available (tokens.access, token, or something else)
      const token = response.tokens?.access || response.token || response.access_token
      if (token) {
        setAuthToken(token)
      }
      if (response.user) {
        setAuthUser(response.user as Record<string, unknown>)
      } else {
        // Fallback: save email as user name if user object not present
        setAuthUser({ email, name: email.split('@')[0] })
      }
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('❌ Login error:', err)
      const msg = err instanceof Error ? err.message : DENIED_MESSAGE
      setErrorMessage(msg)
      setStatus('denied')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* ambient brand glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, oklch(0.45 0.16 290 / 35%), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, oklch(0.55 0.18 45 / 22%), transparent)',
        }}
      />

      <main className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl border border-border p-8 shadow-2xl glow-brand">
          {/* Brand */}
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl">
              <Image
                src="/logo.png"
                alt="شعار ASK CREW"
                width={64}
                height={64}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <h1 className="mt-4 text-2xl font-black text-foreground">ASK CREW</h1>
            <p className="mt-1 text-sm text-muted-foreground">لوحة تحكم القيادة التنفيذية</p>
          </div>

          {status === 'denied' && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold leading-relaxed text-destructive duration-300 animate-in fade-in slide-in-from-top-1"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'granted' && (
            <div
              role="status"
              className="mb-5 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold leading-relaxed duration-300 animate-in fade-in slide-in-from-top-1"
              style={{
                color: 'var(--success)',
                borderColor: 'color-mix(in oklch, var(--success) 40%, transparent)',
                backgroundColor: 'color-mix(in oklch, var(--success) 12%, transparent)',
              }}
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{GRANTED_MESSAGE}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-foreground">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (status === 'denied') setStatus('idle')
                  }}
                  placeholder="admin@askcrew.com"
                  className="input-base pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-foreground">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (status === 'denied') setStatus('idle')
                  }}
                  placeholder="••••••••"
                  className="input-base pr-10"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 glow-brand"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحقق...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  تسجيل الدخول
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            دخول آمن عبر تشفير JWT · جميع الجلسات مسجّلة في سجل التدقيق
          </p>
        </div>
      </main>
    </div>
  )
}
