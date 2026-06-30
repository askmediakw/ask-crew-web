'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clapperboard } from 'lucide-react'

/**
 * Registration scaffold stub.
 * TODO(auth): wire to the real sign-up service + email verification.
 */
export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Stub: proceed to KYC verification step.
    setTimeout(() => router.push('/auth/verify-kyc'), 400)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="glass w-full max-w-md rounded-2xl border border-border p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clapperboard className="h-5 w-5" />
          </span>
          <span className="text-xl font-black tracking-tight">ASK CREW</span>
        </div>
        <h1 className="text-2xl font-black">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">انضم إلى المنصة في خطوات بسيطة.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">الاسم الكامل</label>
            <input id="name" required className="input-base" placeholder="اسمك الكامل" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">البريد الإلكتروني</label>
            <input id="email" type="email" required className="input-base" placeholder="you@example.com" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">كلمة المرور</label>
            <input id="password" type="password" required className="input-base" placeholder="••••••••" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          لديك حساب بالفعل؟{' '}
          <Link href="/auth/login" className="font-bold text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}
