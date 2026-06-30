'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wallet,
  Lock,
  TrendingUp,
  ArrowDownToLine,
  CheckCircle2,
  AlertTriangle,
  Percent,
  ShieldAlert,
  Hourglass,
  PiggyBank,
  Loader2,
} from 'lucide-react'
import { useCurrency } from '@/lib/currency'
import { useEscrow, type EscrowStatus } from '@/lib/escrow-store'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { BankDetailsForm } from '@/components/earnings/bank-details-form'

const STATUS_META: Record<EscrowStatus, { label: string; className: string }> = {
  held: { label: 'محجوز (ضمان)', className: 'bg-warning/15 text-warning' },
  cleared: { label: 'مُفرج عنه', className: 'bg-success/15 text-success' },
  withdrawn: { label: 'تم سحبه', className: 'bg-primary/15 text-primary' },
  disputed: { label: 'نزاع مالي', className: 'bg-destructive/15 text-destructive' },
  refunded: { label: 'مُسترجع للعميل', className: 'bg-accent/15 text-accent' },
}

export function EarningsView() {
  const { format } = useCurrency()
  const { toast } = useToast()
  const {
    loading,
    pendingEscrow,
    available,
    totalWithdrawn,
    commissionRate,
    ledger,
    bank,
    financiallyVerified,
    canWithdraw,
    withdraw,
    releaseProject,
  } = useEscrow()
  const [confirmRelease, setConfirmRelease] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [releasingId, setReleasingId] = useState<string | null>(null)

  async function handleWithdraw() {
    setWithdrawing(true)
    try {
      const amount = await withdraw()
      if (amount > 0) {
        toast.success(`تم إرسال طلب سحب ${format(amount)} إلى حسابك البنكي — يُحوّل خلال 1-3 أيام عمل.`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر إتمام السحب، يرجى المحاولة مجدداً.')
    } finally {
      setWithdrawing(false)
    }
  }

  async function handleRelease(txnId: string) {
    setReleasingId(txnId)
    try {
      await releaseProject(txnId)
      setConfirmRelease(null)
      toast.success('تم تأكيد اكتمال المشروع والإفراج عن المبلغ بعد خصم العمولة.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'تعذّر الإفراج عن المبلغ.')
    } finally {
      setReleasingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm font-medium">جارٍ تحميل بيانات المحفظة...</p>
      </div>
    )
  }

  const balances = [
    {
      label: 'محجوز في الضمان',
      hint: 'أموال مشاريع نشطة مُجمّدة في النظام',
      value: pendingEscrow,
      Icon: Hourglass,
      tint: 'text-warning',
      ring: 'border-warning/30',
    },
    {
      label: 'الرصيد المتاح',
      hint: 'جاهز للسحب الفوري',
      value: available,
      Icon: PiggyBank,
      tint: 'text-success',
      ring: 'border-success/30',
    },
    {
      label: 'إجمالي المسحوبات',
      hint: 'سجل جميع المبالغ المحوّلة',
      value: totalWithdrawn,
      Icon: TrendingUp,
      tint: 'text-primary',
      ring: 'border-primary/30',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-black text-foreground md:text-2xl">
            <Wallet className="h-6 w-6 text-primary" />
            المحفظة ونظام الضمان
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            رصيدك مقسّم إلى ثلاث حالات واضحة، مع خصم تلقائي للعمولة عند اكتمال المشاريع.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={handleWithdraw}
            disabled={!canWithdraw || withdrawing}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition',
              canWithdraw && !withdrawing
                ? 'bg-primary text-primary-foreground hover:opacity-90'
                : 'cursor-not-allowed bg-secondary text-muted-foreground',
            )}
          >
            {withdrawing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : canWithdraw ? (
              <ArrowDownToLine className="h-4 w-4" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {withdrawing ? 'جارٍ السحب...' : 'سحب الرصيد'}
          </button>
          {!canWithdraw && (
            <span className="text-[11px] text-muted-foreground">
              {!financiallyVerified
                ? 'المحفظة مقفلة حتى التحقق المالي'
                : !bank.verified
                  ? 'أضف بياناتك البنكية لتفعيل السحب'
                  : 'لا يوجد رصيد متاح حالياً'}
            </span>
          )}
        </div>
      </div>

      {/* Financial verification lock banner (controlled by Admin in KYC) */}
      {!financiallyVerified && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-bold text-foreground">المحفظة المالية مقفلة</p>
            <p className="text-sm text-muted-foreground">
              لم يتم تفعيل التحقق المالي لحسابك بعد. يقوم فريق الإدارة بمراجعة وثائق الهوية (KYC)
              ثم تفعيل المحفظة يدوياً.
            </p>
            <Link
              href="/dashboard/kyc"
              className="mt-2 inline-block text-sm font-bold text-destructive underline-offset-4 hover:underline"
            >
              الذهاب إلى مركز التحقق
            </Link>
          </div>
        </div>
      )}

      {/* Three segmented balances */}
      <div className="grid gap-4 sm:grid-cols-3">
        {balances.map((b) => (
          <div key={b.label} className={cn('glass rounded-2xl border p-5', b.ring)}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{b.label}</span>
              <b.Icon className={cn('h-5 w-5', b.tint)} />
            </div>
            <p className="mt-3 text-2xl font-black text-foreground">{format(b.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{b.hint}</p>
          </div>
        ))}
      </div>

      {/* Commission notice */}
      <div className="glass flex items-center gap-3 rounded-2xl border border-border p-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Percent className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">
            عمولة المنصة: {(commissionRate * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-muted-foreground">
            تُخصم تلقائياً من مبلغ الضمان قبل تحويل الصافي إلى رصيدك المتاح عند اكتمال المشروع.
          </p>
        </div>
      </div>

      {/* Mandatory IBAN form */}
      <BankDetailsForm />

      {/* Active escrow ledger */}
      <section className="glass overflow-hidden rounded-2xl border border-border">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">سجل الضمان (Escrow)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-right text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">المرجع</th>
                <th className="px-5 py-3 font-semibold">المشروع</th>
                <th className="px-5 py-3 font-semibold">المبلغ الإجمالي</th>
                <th className="px-5 py-3 font-semibold">العمولة</th>
                <th className="px-5 py-3 font-semibold">الصافي</th>
                <th className="px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3 text-center font-semibold">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledger.map((t) => {
                const commission = t.grossKwd * t.commissionRate
                const net = t.grossKwd - commission
                const meta = STATUS_META[t.status]
                return (
                  <tr key={t.id} className="transition hover:bg-white/5">
                    <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.id}</td>
                    <td className="px-5 py-4 font-medium text-foreground">
                      {t.project}
                      <span className="block text-xs text-muted-foreground">من: {t.client}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">{format(t.grossKwd)}</td>
                    <td className="px-5 py-4 text-destructive">- {format(commission)}</td>
                    <td className="px-5 py-4 font-bold text-success">{format(net)}</td>
                    <td className="px-5 py-4">
                      <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-bold', meta.className)}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {t.status === 'held' ? (
                        confirmRelease === t.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleRelease(t.id)}
                              disabled={releasingId === t.id}
                              className="inline-flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/25 disabled:opacity-60"
                            >
                              {releasingId === t.id && <Loader2 className="h-3 w-3 animate-spin" />}
                              تأكيد
                            </button>
                            <button
                              onClick={() => setConfirmRelease(null)}
                              disabled={releasingId === t.id}
                              className="rounded-lg px-2 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground disabled:opacity-60"
                            >
                              إلغاء
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRelease(t.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/25"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            تأكيد الاكتمال
                          </button>
                        )
                      ) : t.status === 'disputed' ? (
                        <Link
                          href="/dashboard/disputes"
                          className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/25"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          عرض النزاع
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
