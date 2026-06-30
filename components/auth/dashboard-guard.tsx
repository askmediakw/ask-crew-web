'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { isAuthenticated } from '@/lib/auth'

/**
 * Client-side session gate for every `/dashboard/*` route.
 *
 * Until a valid VIP session token is confirmed in storage, NOTHING from the
 * dashboard is rendered. Unauthenticated visitors (including someone typing
 * the `/dashboard` URL directly on a brand-new device) are bounced to the
 * login gateway immediately. There is no fallback that renders the dashboard
 * without a verified session.
 */
export function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (isAuthenticated()) {
      setAllowed(true)
    } else {
      // Replace (not push) so the protected URL is not left in history.
      router.replace('/')
    }
  }, [router])

  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="جاري التحقق من الجلسة" />
      </div>
    )
  }

  return <>{children}</>
}
