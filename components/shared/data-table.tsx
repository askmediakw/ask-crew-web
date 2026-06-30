'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SkeletonTable } from '@/components/shared/skeleton'
import { EmptyState } from '@/components/shared/empty-state'

// ============================================================================
// DYNAMIC DATA TABLE (#1)
// ----------------------------------------------------------------------------
// Universal table for ANY JSON array. Auto-derives columns from object keys
// (or pass an explicit column map), and handles search, sort, and pagination
// entirely on the client. Shows skeleton while `loading`, empty state when 0.
//
//   <DataTable data={users} pageSize={10} />
//   <DataTable data={users} columns={{ name: 'الاسم', email: 'البريد' }} />
// ============================================================================

type Row = Record<string, unknown>

export function DataTable<T extends Row>({
  data,
  columns,
  pageSize = 8,
  loading = false,
  renderCell,
  onAdd,
  onRefresh,
}: {
  data: T[]
  columns?: Partial<Record<keyof T, string>>
  pageSize?: number
  loading?: boolean
  renderCell?: (key: keyof T, value: unknown, row: T) => ReactNode
  onAdd?: () => void
  onRefresh?: () => void
}) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<keyof T | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const keys = useMemo<(keyof T)[]>(() => {
    if (columns) return Object.keys(columns) as (keyof T)[]
    return data.length ? (Object.keys(data[0]) as (keyof T)[]) : []
  }, [columns, data])

  const filtered = useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    return data.filter((row) => keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q)))
  }, [data, keys, query])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av == null) return 1
      if (bv == null) return -1
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'ar')
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const pageRows = sorted.slice(current * pageSize, current * pageSize + pageSize)

  const toggleSort = (k: keyof T) => {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(k)
      setSortDir('asc')
    }
  }

  if (loading) return <SkeletonTable rows={pageSize} cols={keys.length || 4} />
  if (!data.length)
    return <EmptyState onAdd={onAdd} onRefresh={onRefresh} description="لا توجد سجلات في هذا الجدول بعد." />

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      {/* Toolbar */}
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="بحث في الجدول..."
            className="input-base py-2 pr-10 text-sm"
          />
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{sorted.length} نتيجة</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-right text-sm">
          <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {keys.map((k) => (
                <th key={String(k)} className="px-5 py-3.5 font-semibold">
                  <button
                    onClick={() => toggleSort(k)}
                    className="flex items-center gap-1.5 transition hover:text-foreground"
                  >
                    {columns?.[k] ?? String(k)}
                    {sortKey === k ? (
                      sortDir === 'asc' ? (
                        <ArrowUp className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <ArrowDown className="h-3.5 w-3.5 text-primary" />
                      )
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                {keys.map((k) => (
                  <td key={String(k)} className="px-5 py-3.5 text-foreground">
                    {renderCell ? renderCell(k, row[k], row) : String(row[k] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-3 border-t border-border p-3">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={current === 0}
          className="flex items-center gap-1 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
          السابق
        </button>
        <span className="text-xs text-muted-foreground">
          صفحة {current + 1} من {pageCount}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={current >= pageCount - 1}
          className="flex items-center gap-1 rounded-lg border border-border bg-white/5 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/10 disabled:opacity-40"
        >
          التالي
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
