'use client'

import { useState } from 'react'
import { Download, Crown, Loader2, Check, Droplet, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'
import { useEscrow } from '@/lib/escrow-store'
import * as api from '@/services/api'

const PREMIUM_PRICE_KWD = 1.0

// ============================================================================
// FREEMIUM PROFILE EXPORT MODAL (micro-transaction)
// Free tier  -> downloadProfile(userId, { watermark: true })
// Premium    -> payAndDownloadProfile(userId, 1.00)  (deducts from wallet)
// ============================================================================
export function ProfileExportModal({
  userId,
  userName,
  onClose,
}: {
  userId: number
  userName: string
  onClose: () => void
}) {
  const { toast } = useToast()
  const { refresh } = useEscrow()
  const [busy, setBusy] = useState<'free' | 'premium' | null>(null)
  const [done, setDone] = useState<'free' | 'premium' | null>(null)

  async function handleFree() {
    setBusy('free')
    try {
      const res = await api.downloadProfile(userId, { watermark: true })
      toast.success(res.message)
      setDone('free')
      setTimeout(onClose, 900)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر تنزيل الملف.')
    } finally {
      setBusy(null)
    }
  }

  async function handlePremium() {
    setBusy('premium')
    try {
      const res = await api.payAndDownloadProfile(userId, PREMIUM_PRICE_KWD)
      toast.success(res.message)
      // Sync the wallet UI everywhere (the balance was just deducted).
      await refresh()
      setDone('premium')
      setTimeout(onClose, 900)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر إتمام عملية الشراء.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[125] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-2xl rounded-2xl border border-border p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-black text-foreground">تصدير الملف الشخصي</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          اختر طريقة تنزيل ملف <span className="font-bold text-foreground">{userName}</span> بصيغة PDF.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* FREE TIER */}
          <div className="flex flex-col rounded-2xl border border-border bg-white/5 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
              <Droplet className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-foreground">تحميل مجاني</h4>
            <p className="mt-0.5 text-xs font-bold text-muted-foreground">النسخة القياسية</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              تنزيل الملف الشخصي مع شعار المنصة الرسمي (علامة مائية).
            </p>
            <button
              onClick={handleFree}
              disabled={busy !== null}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10 disabled:opacity-60"
            >
              {busy === 'free' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : done === 'free' ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {busy === 'free' ? 'جارٍ التنزيل...' : 'تنزيل مع العلامة المائية'}
            </button>
          </div>

          {/* PREMIUM TIER */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-gold/40 bg-gold/5 p-5 glow-gold">
            <span className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gold/20 px-2.5 py-1 text-[10px] font-black text-gold">
              <Sparkles className="h-3 w-3" />
              الأفضل
            </span>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/20 text-gold">
              <Crown className="h-5 w-5" />
            </div>
            <h4 className="text-base font-black text-foreground">تحميل بدون شعار (1 د.ك)</h4>
            <p className="mt-0.5 text-xs font-bold text-gold">النسخة الاحترافية</p>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/80">
              تنزيل ملف PDF نظيف بدون أي علامة تجارية. سيُخصم المبلغ فوراً من محفظتك.
            </p>
            <button
              onClick={handlePremium}
              disabled={busy !== null}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-black text-black transition hover:opacity-90 disabled:opacity-60"
            >
              {busy === 'premium' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : done === 'premium' ? (
                <Check className="h-4 w-4" />
              ) : (
                <Crown className="h-4 w-4" />
              )}
              {busy === 'premium' ? 'جارٍ المعالجة والدفع...' : 'شراء وتنزيل (1.00 د.ك)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
