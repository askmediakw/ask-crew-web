import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type Row = {
  name: string
  email: string
  plan: string
  price: number
  status: string
  active: boolean
  color: string
}

interface EnterprisesTableProps {
  loading?: boolean
  rows?: Row[]
}

export function EnterprisesTable({ loading, rows = [] }: EnterprisesTableProps) {
  if (loading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border glass p-5 md:p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border glass p-5 md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">أحدث الشركات المشتركة</h2>
          <p className="text-sm text-muted-foreground">آخر الاشتراكات المسجّلة في المنصة</p>
        </div>
        <button className="rounded-lg border border-border bg-white/5 px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground">
          عرض الكل
        </button>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[640px] text-right">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th className="px-4 pb-3 font-medium">الشركة</th>
              <th className="px-4 pb-3 font-medium">الباقة</th>
              <th className="px-4 pb-3 font-medium">المبلغ</th>
              <th className="px-4 pb-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.email}
                className={cn(
                  'transition-colors hover:bg-primary/5',
                  i % 2 === 1 && 'bg-white/[0.02]',
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black text-background"
                      style={{ background: row.color }}
                    >
                      {row.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{row.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{row.plan}</td>
                <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{row.price.toLocaleString('ar-EG')} د.ك</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold',
                      row.active
                        ? 'bg-[var(--success)]/15 text-[var(--success)] shadow-[0_0_14px_-2px_var(--success)]'
                        : 'bg-[var(--warning)]/15 text-[var(--warning)]',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        row.active ? 'bg-[var(--success)]' : 'bg-[var(--warning)]',
                      )}
                    />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
