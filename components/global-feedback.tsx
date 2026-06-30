'use client'

import { Loader2, AlertTriangle, X } from 'lucide-react'
import { useFeedback } from '@/lib/api'

/**
 * Global, app-wide feedback surfaces driven by the FeedbackProvider:
 * - A top-center "processing" pill while any request is in-flight.
 * - A bottom-start error toast (dismissable) when a request fails.
 * Mounted once in <AppShell>; no component needs its own copy.
 */
export function GlobalFeedback() {
  const { isLoading, errorMessage, setError } = useFeedback()

  return (
    <>
      {isLoading && (
        <div
          role="status"
          aria-live="polite"
          className="animate-slide-down glass fixed left-1/2 top-5 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-full border border-primary/30 px-6 py-2.5 text-foreground shadow-2xl"
        >
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-bold">جاري معالجة الطلب...</span>
        </div>
      )}

      {errorMessage && (
        <button
          type="button"
          onClick={() => setError(null)}
          aria-live="assertive"
          className="animate-slide-up fixed bottom-5 right-5 z-[100] flex items-center gap-3 rounded-xl border border-destructive bg-destructive/90 px-6 py-4 text-right text-white shadow-2xl transition hover:bg-destructive"
        >
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-bold">{errorMessage}</span>
          <X className="h-4 w-4 shrink-0 opacity-70" />
        </button>
      )}
    </>
  )
}
