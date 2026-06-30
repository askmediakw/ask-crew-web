'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BadgeCheck, ArrowLeft } from 'lucide-react'
import { Uploader } from '@/components/shared/uploader'

/**
 * KYC verification onboarding scaffold stub.
 * TODO(backend): upload identity docs via /api/uploads/presign and submit to a
 * verification provider; gate dashboard access until approved.
 */
export default function VerifyKycPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit() {
    setSubmitting(true)
    setTimeout(() => router.push('/dashboard'), 600)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="glass w-full max-w-lg rounded-2xl border border-border p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <span className="text-xl font-black tracking-tight">التحقق من الهوية</span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          لإكمال التسجيل، يرجى رفع صورة واضحة من وثيقة هوية رسمية (بطاقة مدنية أو جواز سفر).
        </p>

        <div className="mt-6 space-y-4">
          <Uploader accept="image/*" />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال للمراجعة'}
          <ArrowLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
