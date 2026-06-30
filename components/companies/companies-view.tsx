'use client'

import { useState } from 'react'
import { Building2, Search, Plus, AlertTriangle, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { ExportButtons } from '@/components/shared/export-buttons'
import { useModal } from '@/lib/modal'
import { ContractModalContent } from '@/components/companies/contract-modal'

type Company = {
  id: number
  name: string
  initials: string
  seatsUsed: number
  seatsTotal: number
  slaExpiry: string
  daysLeft: number
  manager: string
  whiteLabel: boolean
}

const initialCompanies: Company[] = [
  { id: 1, name: 'رويال للإنتاج الفني', initials: 'ر', seatsUsed: 84, seatsTotal: 100, slaExpiry: '2026-09-12', daysLeft: 86, manager: 'سارة العنزي', whiteLabel: true },
  { id: 2, name: 'سينما آرت الكويت', initials: 'س', seatsUsed: 38, seatsTotal: 50, slaExpiry: '2026-07-01', daysLeft: 13, manager: 'خالد المطيري', whiteLabel: false },
  { id: 3, name: 'فوكس ميديا', initials: 'ف', seatsUsed: 19, seatsTotal: 25, slaExpiry: '2026-12-30', daysLeft: 195, manager: 'سارة العنزي', whiteLabel: true },
  { id: 4, name: 'استوديو النخبة', initials: 'ن', seatsUsed: 142, seatsTotal: 150, slaExpiry: '2026-06-22', daysLeft: 4, manager: 'عبدالله الراشد', whiteLabel: false },
  { id: 5, name: 'مجموعة الخليج للإعلام', initials: 'خ', seatsUsed: 60, seatsTotal: 200, slaExpiry: '2027-01-15', daysLeft: 211, manager: 'خالد المطيري', whiteLabel: true },
]

export function CompaniesView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [companies, setCompanies] = useState(initialCompanies)
  const [query, setQuery] = useState('')
  const [dragId, setDragId] = useState<number | null>(null)

  const accent = execMode ? 'text-destructive' : 'text-primary'
  const accentBg = execMode ? 'bg-destructive' : 'bg-primary'

  const filtered = companies.filter((c) => c.name.includes(query) || c.manager.includes(query))

  const toggleWhiteLabel = (id: number) =>
    setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, whiteLabel: !c.whiteLabel } : c)))

  const addCompany = () => {
    const num = companies.length + 1
    setCompanies((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `شركة جديدة ${num}`,
        initials: 'ج',
        seatsUsed: 0,
        seatsTotal: 10,
        slaExpiry: '2027-01-01',
        daysLeft: 365,
        manager: 'غير محدد',
        whiteLabel: false,
      },
    ])
  }

  const deleteCompany = (id: number) =>
    setCompanies((prev) => prev.filter((c) => c.id !== id))

  const handleDrop = (targetId: number) => {
    if (dragId === null || dragId === targetId) return setDragId(null)
    setCompanies((prev) => {
      const list = [...prev]
      const from = list.findIndex((c) => c.id === dragId)
      const to = list.findIndex((c) => c.id === targetId)
      const [moved] = list.splice(from, 1)
      list.splice(to, 0, moved)
      return list
    })
    setDragId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Building2 className={cn('h-6 w-6', accent)} />
            إدارة الشركات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            عقود B2B والتراخيص واتفاقيات مستوى الخدمة (SLA)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportButtons
            label="الشركات"
            rows={filtered}
            columns={[
              { key: 'name', header: 'اسم الشركة' },
              { key: 'manager', header: 'مدير الحساب' },
              { key: 'seatsUsed', header: 'المقاعد المستخدمة' },
              { key: 'seatsTotal', header: 'إجمالي المقاعد' },
              { key: 'slaExpiry', header: 'انتهاء SLA' },
              { key: 'daysLeft', header: 'الأيام المتبقية' },
              { key: 'whiteLabel', header: 'علامة بيضاء' },
            ]}
          />
          <button
            onClick={addCompany}
            className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة شركة جديدة
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث باسم الشركة أو مدير الحساب..."
          className="input-base pr-10"
        />
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[760px] text-right">
            <thead>
              <tr className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 font-semibold">الشركة</th>
                <th className="px-5 py-4 font-semibold">التراخيص المستخدمة</th>
                <th className="px-5 py-4 font-semibold">انتهاء الـ SLA</th>
                <th className="px-5 py-4 font-semibold">مدير الحساب</th>
                <th className="px-5 py-4 text-center font-semibold">العلامة البيضاء</th>
                <th className="px-5 py-4 text-center font-semibold">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const pct = Math.round((c.seatsUsed / c.seatsTotal) * 100)
                const urgent = c.daysLeft <= 14
                return (
                  <tr
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(c.id)}
                    className={cn(
                      'group border-b border-border/60 transition-colors last:border-0 hover:bg-white/5',
                      dragId === c.id && 'opacity-40',
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 transition group-hover:text-foreground active:cursor-grabbing" />
                        <span
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black text-white',
                            execMode
                              ? 'bg-gradient-to-br from-destructive to-gold'
                              : 'bg-gradient-to-br from-primary to-accent',
                          )}
                        >
                          {c.initials}
                        </span>
                        <span className="font-semibold text-foreground">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-40">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-mono text-muted-foreground">
                            {c.seatsUsed}/{c.seatsTotal}
                          </span>
                          <span className={cn('font-bold', pct >= 90 ? 'text-warning' : accent)}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div
                            className={cn('h-full rounded-full', pct >= 90 ? 'bg-warning' : accentBg)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {urgent && <AlertTriangle className="h-4 w-4 text-destructive" />}
                        <div className="leading-tight">
                          <p className="font-mono text-sm text-foreground">{c.slaExpiry}</p>
                          <p
                            className={cn(
                              'text-xs',
                              urgent ? 'font-bold text-destructive' : 'text-muted-foreground',
                            )}
                          >
                            {c.daysLeft} يوم متبقٍ
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{c.manager}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleWhiteLabel(c.id)}
                          role="switch"
                          aria-checked={c.whiteLabel}
                          className={cn(
                            'relative h-6 w-11 rounded-full transition-colors',
                            c.whiteLabel ? (execMode ? 'bg-destructive' : 'bg-primary') : 'bg-white/15',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
                              c.whiteLabel ? 'right-0.5' : 'right-5',
                            )}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() =>
                            openModal({
                              title: `إدارة العقود — ${c.name}`,
                              content: <ContractModalContent companyName={c.name} />,
                            })
                          }
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-white/20"
                        >
                          إدارة العقود
                        </button>
                        <button
                          onClick={() => deleteCompany(c.id)}
                          aria-label={`حذف ${c.name}`}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive transition hover:bg-destructive hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
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
