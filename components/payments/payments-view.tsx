'use client'

import { useState } from 'react'
import { Receipt, Check, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { ExportButtons } from '@/components/shared/export-buttons'
import { GatewayIcons } from '@/components/shared/geo-widgets'
import { CurrencySwitcher } from '@/components/shared/currency-switcher'
import { useCurrency } from '@/lib/currency'

type Tone = 'success' | 'pending' | 'danger' | 'refunded'

type Invoice = {
  id: string
  amountKwd: number
  method: string
  date: string
  status: string
  tone: Tone
}

const initialInvoices: Invoice[] = [
  { id: 'INV-2026-01', amountKwd: 1152, method: 'K-Net', date: 'اليوم', status: 'ناجح', tone: 'success' },
  { id: 'INV-2026-02', amountKwd: 480, method: 'Visa', date: 'أمس', status: 'ناجح', tone: 'success' },
  { id: 'INV-2026-03', amountKwd: 2300, method: 'تحويل بنكي', date: 'قبل 3 أيام', status: 'قيد المعالجة', tone: 'pending' },
  { id: 'INV-2026-04', amountKwd: 75, method: 'Apple Pay', date: 'قبل 5 أيام', status: 'نزاع مالي', tone: 'danger' },
]

const toneClass: Record<Tone, string> = {
  success: 'bg-success/20 text-success',
  pending: 'bg-gold/20 text-gold',
  danger: 'bg-destructive/20 text-destructive',
  refunded: 'bg-accent/20 text-accent',
}

export function PaymentsView() {
  const { execMode } = useExecMode()
  const { format, currency } = useCurrency()
  const [invoices, setInvoices] = useState(initialInvoices)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const update = (id: string, status: string, tone: Tone) =>
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status, tone } : inv)))

  // Total in the active display currency.
  const total = invoices.reduce((sum, inv) => sum + inv.amountKwd, 0)
  // Pre-formatted rows for export in the active currency.
  const exportRows = invoices.map((inv) => ({
    id: inv.id,
    amount: format(inv.amountKwd),
    method: inv.method,
    date: inv.date,
    status: inv.status,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Receipt className={cn('h-6 w-6', accent)} />
            سجل المدفوعات والفواتير
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            جميع المعاملات المالية، النزاعات، وعمليات الاسترجاع.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CurrencySwitcher />
          <ExportButtons
            label="المدفوعات"
            rows={exportRows}
            columns={[
              { key: 'id', header: 'رقم الفاتورة' },
              { key: 'amount', header: 'المبلغ' },
              { key: 'method', header: 'طريقة الدفع' },
              { key: 'date', header: 'التاريخ' },
              { key: 'status', header: 'الحالة' },
            ]}
          />
        </div>
      </div>

      {/* Live total in the selected currency (#12) */}
      <div className="glass flex items-center justify-between rounded-2xl border border-border p-4">
        <span className="text-sm text-muted-foreground">إجمالي المعاملات ({currency})</span>
        <span className="text-xl font-black text-foreground">{format(total)}</span>
      </div>

      {/* Supported payment gateways routed by the user's country */}
      <div className="glass rounded-2xl border border-border p-4">
        <GatewayIcons
          country="الكويت"
          gateways={[
            { label: 'K-NET', className: 'border-border bg-white text-black' },
            { label: 'VISA', className: 'border-primary/50 bg-primary text-primary-foreground' },
            { label: 'MASTER', className: 'border-destructive/50 bg-destructive/90 text-white' },
            { label: 'APPLE', className: 'border-border bg-foreground text-background' },
          ]}
        />
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">رقم الفاتورة</th>
                <th className="px-5 py-4 font-semibold">المبلغ</th>
                <th className="px-5 py-4 font-semibold">طريقة الدفع</th>
                <th className="px-5 py-4 font-semibold">التاريخ</th>
                <th className="px-5 py-4 font-semibold">الحالة</th>
                <th className="px-5 py-4 text-center font-semibold">الإجراءات المالية</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="group border-b border-border/60 transition last:border-0 hover:bg-white/5">
                  <td className="px-5 py-4 font-mono text-foreground">{inv.id}</td>
                  <td className="px-5 py-4 font-bold text-foreground">{format(inv.amountKwd)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.method}</td>
                  <td className="px-5 py-4 text-muted-foreground">{inv.date}</td>
                  <td className="px-5 py-4">
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', toneClass[inv.tone])}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {inv.tone === 'pending' && (
                        <>
                          <button
                            onClick={() => update(inv.id, 'ناجح', 'success')}
                            className="flex items-center gap-1 rounded-lg bg-success/15 px-3 py-1.5 text-xs font-bold text-success transition hover:bg-success/25"
                          >
                            <Check className="h-3.5 w-3.5" />
                            اعتماد
                          </button>
                          <button
                            onClick={() => update(inv.id, 'مرفوض', 'danger')}
                            className="flex items-center gap-1 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/25"
                          >
                            <X className="h-3.5 w-3.5" />
                            رفض
                          </button>
                        </>
                      )}
                      {(inv.tone === 'success' || inv.tone === 'danger') && (
                        <button
                          onClick={() => update(inv.id, 'تم الاسترجاع', 'refunded')}
                          className="flex items-center gap-1 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-bold text-accent transition hover:bg-accent/25"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          استرجاع المبلغ
                        </button>
                      )}
                      {inv.tone === 'refunded' && (
                        <span className="text-xs text-muted-foreground">اكتملت المعالجة</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
