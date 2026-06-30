'use client'

import { useState } from 'react'
import { FileText, Download, CheckCircle2, Clock, XCircle, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddNewButton, RowActions, type CrudField } from '@/components/shared/crud'

type ContractStatus = 'signed' | 'pending' | 'expired' | 'draft'

type ContractRecord = {
  id: string
  title: string
  party: string
  value: string
  date: string
  version: string
  status: ContractStatus
}

const STATUS_META: Record<ContractStatus, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  signed: { label: 'موقّع', className: 'bg-success/15 text-success', Icon: CheckCircle2 },
  pending: { label: 'بانتظار التوقيع', className: 'bg-warning/15 text-warning', Icon: Clock },
  expired: { label: 'منتهي', className: 'bg-destructive/15 text-destructive', Icon: XCircle },
  draft: { label: 'مسودة', className: 'bg-muted text-muted-foreground', Icon: FileText },
}

// TODO(db): replace with GET /api/contracts?companyId= — currently mock history.
const MOCK_HISTORY: ContractRecord[] = [
  { id: 'CT-2026-014', title: 'عقد إنتاج مسلسل درامي', party: 'استوديو الخليج', value: '12,500 د.ك', date: '2026-06-01', version: 'v3', status: 'signed' },
  { id: 'CT-2026-009', title: 'اتفاقية تصوير إعلان', party: 'شركة أفق', value: '3,200 د.ك', date: '2026-05-18', version: 'v2', status: 'signed' },
  { id: 'CT-2026-021', title: 'عقد توريد معدات إضاءة', party: 'Gear Hub', value: '5,750 د.ك', date: '2026-06-15', version: 'v1', status: 'pending' },
  { id: 'CT-2026-003', title: 'اتفاقية ورشة تدريب', party: 'أكاديمية السينما', value: '900 د.ك', date: '2026-02-10', version: 'v1', status: 'expired' },
  { id: 'CT-2026-027', title: 'عقد رعاية مهرجان', party: 'مؤسسة الفن', value: '8,000 د.ك', date: '2026-06-20', version: 'v1', status: 'draft' },
]

const statusOptions = [
  { value: 'draft', label: 'مسودة' },
  { value: 'pending', label: 'بانتظار التوقيع' },
  { value: 'signed', label: 'موقّع' },
  { value: 'expired', label: 'منتهي' },
]

const contractFields = (r?: ContractRecord): CrudField[] => [
  { key: 'title', label: 'عنوان العقد', value: r?.title, full: true, placeholder: 'مثال: عقد إنتاج مسلسل' },
  { key: 'party', label: 'الطرف', value: r?.party, placeholder: 'اسم الطرف الآخر' },
  { key: 'value', label: 'القيمة', value: r?.value, placeholder: '12,500 د.ك' },
  { key: 'date', label: 'التاريخ', value: r?.date, type: 'date' },
  { key: 'status', label: 'الحالة', value: r?.status ?? 'draft', type: 'select', options: statusOptions },
]

export function ContractHistory({ records = MOCK_HISTORY }: { records?: ContractRecord[] }) {
  const [list, setList] = useState<ContractRecord[]>(records)

  const addContract = (v: Record<string, string>) =>
    setList((prev) => [
      {
        id: `CT-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: v.title,
        party: v.party,
        value: v.value,
        date: v.date,
        version: 'v1',
        status: (v.status as ContractStatus) || 'draft',
      },
      ...prev,
    ])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-bold text-foreground">سجل العقود السابقة</h4>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{list.length}</span>
        <div className="ms-auto">
          <AddNewButton
            label="إضافة عقد جديد"
            entityLabel="العقد"
            fields={contractFields()}
            onCreated={addContract}
            className="px-4 py-2 text-xs"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">رقم العقد</th>
                <th className="px-4 py-3 font-semibold">العنوان</th>
                <th className="px-4 py-3 font-semibold">الطرف</th>
                <th className="px-4 py-3 font-semibold">القيمة</th>
                <th className="px-4 py-3 font-semibold">التاريخ</th>
                <th className="px-4 py-3 font-semibold">النسخة</th>
                <th className="px-4 py-3 font-semibold">الحالة</th>
                <th className="px-4 py-3 font-semibold">تنزيل</th>
                <th className="px-4 py-3 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => {
                const meta = STATUS_META[r.status]
                return (
                  <tr key={r.id} className="transition hover:bg-white/5">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.party}</td>
                    <td className="px-4 py-3 font-bold text-foreground">{r.value}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.version}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold', meta.className)}>
                        <meta.Icon className="h-3 w-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        aria-label={`تنزيل ${r.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        entityLabel="العقد"
                        entityName={r.id}
                        fields={contractFields(r)}
                        onEdited={(v) =>
                          setList((prev) =>
                            prev.map((x) =>
                              x.id === r.id ? { ...x, ...v, status: (v.status as ContractStatus) || x.status } : x,
                            ),
                          )
                        }
                        onDeleted={() => setList((prev) => prev.filter((x) => x.id !== r.id))}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
