'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// GLOBAL TOAST / SNACKBAR SYSTEM (#6)
// ----------------------------------------------------------------------------
// const { toast } = useToast()
// toast.success('تم الحفظ'); toast.error('فشل الطلب'); toast.warning(...)
// ============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info'
type Toast = { id: number; type: ToastType; message: string }

type ToastApi = {
  success: (m: string) => void
  error: (m: string) => void
  warning: (m: string) => void
  info: (m: string) => void
}

const ToastContext = createContext<{ toast: ToastApi } | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}

const config: Record<ToastType, { icon: typeof Info; cls: string }> = {
  success: { icon: CheckCircle2, cls: 'border-success/40 text-success' },
  error: { icon: AlertCircle, cls: 'border-destructive/40 text-destructive' },
  warning: { icon: AlertTriangle, cls: 'border-warning/40 text-warning' },
  info: { icon: Info, cls: 'border-primary/40 text-primary' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const toast: ToastApi = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    warning: (m) => push('warning', m),
    info: (m) => push('info', m),
  }

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[120] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => {
          const { icon: Icon, cls } = config[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                'animate-slide-up glass flex items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl',
                cls,
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-bold text-foreground">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="text-muted-foreground transition hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
