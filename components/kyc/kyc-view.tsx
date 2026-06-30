'use client'

import { useState } from 'react'
import { BadgeCheck, Eye, Check, X, IdCard, FileBadge, Wallet, Lock, ShieldCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useEscrow } from '@/lib/escrow-store'
import { useToast } from '@/lib/toast'

type Status = 'pending' | 'approved' | 'rejected'

type Applicant = {
  id: number
  name: string
  type: 'فرد' | 'شركة'
  docType: string
  docIcon: typeof IdCard
  submitted: string
  status: Status
}

const initial: Applicant[] = [
  { id: 1, name: 'منى الصباح', type: 'فرد', docType: 'بطاقة مدنية', docIcon: IdCard, submitted: 'اليوم', status: 'pending' },
  { id: 2, name: 'سينما آرت الكويت', type: 'شركة', docType: 'رخصة تجارية', docIcon: FileBadge, submitted: 'أمس', status: 'pending' },
  { id: 3, name: 'بدر العتيبي', type: 'فرد', docType: 'جواز سفر', docIcon: IdCard, submitted: 'قبل يومين', status: 'pending' },
  { id: 4, name: 'فوكس ميديا', type: 'شركة', docType: 'رخصة تجارية', docIcon: FileBadge, submitted: 'قبل 3 أيام', status: 'approved' },
]

const statusMeta: Record<Status, { label: string; cls: string }> = {
  pending: { label: 'قيد المراجعة', cls: 'bg-gold/20 text-gold' },
  approved: { label: 'موثّق', cls: 'bg-success/20 text-success' },
  rejected: { label: 'مرفوض', cls: 'bg-destructive/20 text-destructive' },
}

export function KycView() {
  const { execMode } = useExecMode()
  const { financiallyVerified, setFinanciallyVerified } = useEscrow()
  const { toast } = useToast()
  const [rows, setRows] = useState(initial)
  const [preview, setPreview] = useState<Applicant | null>(null)
  const [verifying, setVerifying] = useState(false)

  async function handleToggleVerification() {
    const next = !financiallyVerified
    setVerifying(true)
    try {
      await setFinanciallyVerified(next)
      toast.success(next ? 'تم تفعيل المحفظة المالية للمستخدم.' : 'تم قفل المحفظة المالية للمستخدم.')
    } catch {
      toast.error('تعذّر تحديث حالة التحقق المالي.')
    } finally {
      setVerifying(false)
    }
  }
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const setStatus = (id: number, status: Status) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))

  const pendingCount = rows.filter((r) => r.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <BadgeCheck className={cn('h-6 w-6', accent)} />
          التحقق من الهويات (KYC)
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pendingCount} طلب بانتظار المراجعة — اعتماد أو رفض وثائق المستخدمين والشركات.
        </p>
      </div>

      {/* Admin "Financially Verified" toggle — gates access to the user wallet. */}
      <div
        className={cn(
          'glass flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5',
          financiallyVerified ? 'border-success/30' : 'border-destructive/30',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              financiallyVerified ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
            )}
          >
            {financiallyVerified ? <ShieldCheck className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              التحقق المالي (تفعيل المحفظة)
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              تبقى المحفظة المالية للمستخدم مقفلة (لا يمكن السحب) حتى يقوم المسؤول بتفعيل التحقق المالي يدوياً
              بعد مراجعة وثائق الهوية.
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={financiallyVerified}
          disabled={verifying}
          onClick={handleToggleVerification}
          className="flex items-center gap-3 rounded-xl border border-border bg-white/5 px-4 py-2.5 disabled:opacity-70"
        >
          {verifying && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <span className="text-sm font-bold text-foreground">
            {financiallyVerified ? 'مُفعّلة' : 'مقفلة'}
          </span>
          <span
            className={cn(
              'relative h-6 w-11 rounded-full transition',
              financiallyVerified ? 'bg-success' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all',
                financiallyVerified ? 'left-0.5' : 'left-[22px]',
              )}
            />
          </span>
        </button>
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">مقدّم الطلب</th>
                <th className="px-5 py-4 font-semibold">النوع</th>
                <th className="px-5 py-4 font-semibold">نوع الوثيقة</th>
                <th className="px-5 py-4 font-semibold">المعاينة</th>
                <th className="px-5 py-4 font-semibold">الحالة</th>
                <th className="px-5 py-4 text-center font-semibold">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const DocIcon = r.docIcon
                return (
                  <tr key={r.id} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                    <td className="px-5 py-4 font-bold text-foreground">{r.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">{r.type}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <DocIcon className="h-4 w-4" />
                        {r.docType}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setPreview(r)}
                        className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        عرض الوثيقة
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', statusMeta[r.status].cls)}>
                        {statusMeta[r.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => setStatus(r.id, 'approved')}
                              className="flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/25"
                            >
                              <Check className="h-3.5 w-3.5" />
                              اعتماد
                            </button>
                            <button
                              onClick={() => setStatus(r.id, 'rejected')}
                              className="flex items-center gap-1 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/25"
                            >
                              <X className="h-3.5 w-3.5" />
                              رفض
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">تمت المعالجة</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPreview(null)}
        >
          <div
            className="glass w-full max-w-md rounded-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-foreground">معاينة الوثيقة</h3>
              <button
                onClick={() => setPreview(null)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex aspect-[1.6/1] items-center justify-center rounded-xl border border-dashed border-border bg-white/5">
              <div className="text-center">
                <preview.docIcon className={cn('mx-auto mb-2 h-10 w-10', accent)} />
                <p className="text-sm font-bold text-foreground">{preview.docType}</p>
                <p className="text-xs text-muted-foreground">{preview.name}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              معاينة تجريبية — سيتم ربطها بوثيقة المستخدم الفعلية من الباك إند.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
