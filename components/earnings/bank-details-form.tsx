'use client'

import { useState, type FormEvent } from 'react'
import { Landmark, ShieldCheck, CheckCircle2, Pencil, Loader2 } from 'lucide-react'
import { useEscrow } from '@/lib/escrow-store'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

// Mandatory bank details (IBAN) form. Withdrawals are blocked until these
// fields are populated and verified — enforced via `bank.verified` in the store.
export function BankDetailsForm() {
  const { bank, saveBankDetails } = useEscrow()
  const { toast } = useToast()
  const [editing, setEditing] = useState(!bank.verified)
  const [iban, setIban] = useState(bank.iban)
  const [bankName, setBankName] = useState(bank.bankName)
  const [accountHolder, setAccountHolder] = useState(bank.accountHolder)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Light Kuwait IBAN check: "KW" + 28 alphanumerics (30 total). Demo-grade.
  function isValidIban(value: string) {
    const normalized = value.replace(/\s+/g, '').toUpperCase()
    return /^KW[0-9A-Z]{28}$/.test(normalized)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!accountHolder.trim() || !bankName.trim()) {
      setError('يرجى تعبئة جميع الحقول المطلوبة.')
      return
    }
    if (!isValidIban(iban)) {
      setError('رقم الآيبان غير صالح. يجب أن يبدأ بـ KW ويتكون من 30 خانة.')
      return
    }
    setError(null)
    setSaving(true)
    try {
      await saveBankDetails({
        iban: iban.replace(/\s+/g, '').toUpperCase(),
        bankName: bankName.trim(),
        accountHolder: accountHolder.trim(),
      })
      setEditing(false)
      toast.success('تم حفظ البيانات البنكية والتحقق منها — يمكنك الآن سحب رصيدك.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حفظ البيانات البنكية.')
    } finally {
      setSaving(false)
    }
  }

  if (bank.verified && !editing) {
    return (
      <section className="glass rounded-2xl border border-border p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">الحساب البنكي للسحب</h2>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
            <ShieldCheck className="h-3.5 w-3.5" />
            موثّق
          </span>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">اسم صاحب الحساب</dt>
            <dd className="mt-1 font-bold text-foreground">{bank.accountHolder}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">البنك</dt>
            <dd className="mt-1 font-bold text-foreground">{bank.bankName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">رقم الآيبان (IBAN)</dt>
            <dd className="mt-1 font-mono text-sm font-bold text-foreground" dir="ltr">
              {bank.iban.replace(/(.{4})/g, '$1 ').trim()}
            </dd>
          </div>
        </dl>
        <button
          onClick={() => setEditing(true)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل البيانات
        </button>
      </section>
    )
  }

  return (
    <section className="glass rounded-2xl border border-border p-5">
      <div className="mb-1 flex items-center gap-2">
        <Landmark className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">بيانات الحساب البنكي</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        إلزامية لتفعيل السحب. لن تتمكن من سحب رصيدك حتى يتم حفظ هذه البيانات والتحقق منها.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">اسم صاحب الحساب</span>
          <input
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="الاسم الكامل كما في البنك"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">اسم البنك</span>
          <input
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="مثال: بنك الكويت الوطني"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-semibold text-muted-foreground">رقم الآيبان (IBAN)</span>
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
            placeholder="KW00 0000 0000 0000 0000 0000 0000"
            dir="ltr"
            className="rounded-xl border border-border bg-background px-3 py-2.5 text-right font-mono text-sm text-foreground outline-none transition focus:border-primary"
          />
        </label>

        {error && (
          <p role="alert" className="sm:col-span-2 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <div className={cn('flex items-center gap-3 sm:col-span-2')}>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {saving ? 'جارٍ التحقق...' : 'حفظ والتحقق'}
          </button>
          {bank.verified && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-muted-foreground transition hover:text-foreground"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </section>
  )
}
