'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Lock, Mail, LogIn, Loader2, ShieldCheck, ShieldAlert } from 'lucide-react'
import { setAuthToken } from '@/lib/auth'
import { useApi } from '@/lib/api'

// Sovereign gold/bronze accent used for the legal accreditation line.
const GOLD = '#D4AF37'

const DENIED_MESSAGE =
  'عفواً.. تم رفض الوصول. هذه البوابة مقتصرة على القيادة التنفيذية وعمليات التدقيق فقط.'
const GRANTED_MESSAGE = 'تم التحقق بنجاح.. جاري تشفير الاتصال ونقلك للوحة القيادة.'

export function ExecutiveLoginGateway() {
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground">
      {/* ambient sovereign glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% -10%, oklch(0.45 0.16 290 / 32%), transparent), radial-gradient(ellipse 55% 45% at 50% 110%, oklch(0.55 0.18 45 / 18%), transparent)',
        }}
      />

      <main className="relative z-10 flex w-full max-w-md flex-col items-center">
        <div className="glass w-full rounded-3xl border border-border p-8 shadow-2xl glow-brand">
          {/* Prominent brand logo */}
          <div className="mb-7 flex flex-col items-center text-center">
            <span
              className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/[0.03] p-2"
              style={{ filter: 'drop-shadow(0 0 22px color-mix(in oklch, var(--primary) 55%, transparent))' }}
            >
              <Image
                src="/ask-crew-logo.svg"
                alt="شعار ASK CREW"
                width={96}
                height={96}
                className="h-full w-full object-contain"
                priority
              />
            </span>

            <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground text-balance">
              بوابة القيادة التنفيذية
            </h1>

            {/* Founder & CEO badge — sophisticated muted silver tone */}
            <p className="mt-2 text-xs font-semibold leading-relaxed text-[oklch(0.78_0.01_260)]">
              تأسيس وإدارة الرئيس التنفيذي: عامر سرور كامل الفضلي
            </p>
          </div>

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

            {status === 'denied' && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-semibold leading-relaxed text-destructive duration-300 animate-in fade-in slide-in-from-top-1"
              >
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'granted' && (
              <div
                role="status"
                className="flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-semibold leading-relaxed duration-300 animate-in fade-in slide-in-from-top-1"
                style={{
                  color: 'var(--success)',
                  borderColor: 'color-mix(in oklch, var(--success) 40%, transparent)',
                  backgroundColor: 'color-mix(in oklch, var(--success) 12%, transparent)',
                }}
              >
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{GRANTED_MESSAGE}</span>
              </div>
            )}

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

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            دخول آمن عبر تشفير JWT · جميع الجلسات مسجّلة في سجل التدقيق
          </p>
        </div>
      </main>

      {/* Prestigious royal footer */}
      <footer className="relative z-10 mt-8 px-4 text-center text-xs leading-relaxed text-muted-foreground">
        © 2026 ASK CREW{' '}
        <span className="mx-1 text-border">|</span>{' '}
        <span style={{ color: GOLD }} className="font-bold">
          الاعتماد القانوني والسيادي: أستاذة العنود ضاحي الفضلي
        </span>
      </footer>
    </div>
  )
}
