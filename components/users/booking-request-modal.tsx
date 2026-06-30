'use client'

import { useState } from 'react'
import { CalendarPlus, Loader2, Check, Wallet, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { useEscrow } from '@/lib/escrow-store'
import { BnplWidget } from '@/components/shared/bnpl-widget'
import * as api from '@/services/api'
import type { BnplProvider } from '@/types'

type PayMethod = 'wallet' | 'bnpl'

// ============================================================================
// REQUEST BOOKING MODAL — with integrated BNPL (Tabby / Tamara) checkout.
// ============================================================================
export function BookingRequestModal({
  userId,
  userName,
  selectedDate,
  dayRateKwd,
  onClose,
  onBooked,
}: {
  userId: number
  userName: string
  selectedDate: string | null
  dayRateKwd: number
  onClose: () => void
  onBooked?: () => void
}) {
  const { toast } = useToast()
  const { refresh } = useEscrow()
  const [method, setMethod] = useState<PayMethod>('wallet')
  const [provider, setProvider] = useState<BnplProvider | null>(null)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const dateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'لم يتم تحديد تاريخ'

  async function handleConfirm() {
    if (!selectedDate) {
      toast.error('يرجى اختيار تاريخ متاح من الرزنامة أولاً.')
      return
    }
    if (method === 'bnpl' && !provider) {
      toast.error('يرجى اختيار مزوّد الدفع (تابي أو تمارا).')
      return
    }
    setBusy(true)
    try {
      if (method === 'bnpl' && provider) {
        const checkout = await api.createBnplCheckout(provider, dayRateKwd)
        toast.success(checkout.message)
      }
      const res = await api.createBooking({
        userId,
        date: selectedDate,
        note: note.trim() || undefined,
        amountKwd: dayRateKwd,
        payment:
          method === 'bnpl' && provider
            ? { method: 'bnpl', provider, installments: 4 }
            : { method: 'wallet' },
      })
      toast.success(res.message)
      if (method === 'wallet') await refresh()
      setDone(true)
      onBooked?.()
      setTimeout(onClose, 1000)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر تأكيد الحجز.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-lg rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2">
          <CalendarPlus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground">طلب حجز</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          حجز <span className="font-bold text-foreground">{userName}</span> ليوم{' '}
          <span className="font-bold text-foreground">{dateLabel}</span>
        </p>

        {/* Amount summary */}
        <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-white/5 p-3">
          <span className="text-sm text-muted-foreground">السعر اليومي</span>
          <span className="text-lg font-black text-foreground">{dayRateKwd.toFixed(2)} د.ك</span>
        </div>

        {/* Optional note */}
        <label className="mb-1.5 block text-xs font-bold text-muted-foreground">ملاحظة (اختياري)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="تفاصيل المشروع أو متطلبات خاصة..."
          className="mb-4 w-full resize-none rounded-xl border border-border bg-white/5 p-3 text-sm text-foreground outline-none transition focus:border-primary"
        />

        {/* Payment method toggle */}
        <p className="mb-2 text-xs font-bold text-muted-foreground">طريقة الدفع</p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMethod('wallet')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition',
              method === 'wallet'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10',
            )}
          >
            <Wallet className="h-4 w-4" />
            المحفظة
          </button>
          <button
            type="button"
            onClick={() => setMethod('bnpl')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition',
              method === 'bnpl'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-white/5 text-muted-foreground hover:bg-white/10',
            )}
          >
            <CreditCard className="h-4 w-4" />
            تقسيط (BNPL)
          </button>
        </div>

        {/* BNPL widget */}
        {method === 'bnpl' && (
          <div className="mb-4">
            <BnplWidget amountKwd={dayRateKwd} selected={provider} onSelect={setProvider} />
          </div>
        )}

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={busy || done}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : done ? (
            <Check className="h-4 w-4" />
          ) : (
            <CalendarPlus className="h-4 w-4" />
          )}
          {busy ? 'جارٍ تأكيد الحجز...' : done ? 'تم تأكيد الحجز' : 'تأكيد الحجز'}
        </button>
      </div>
    </div>
  )
}
