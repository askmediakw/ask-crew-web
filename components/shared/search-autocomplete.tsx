'use client'

import { useMemo, useState } from 'react'
import { Search, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// SEARCH & AUTO-COMPLETE BAR (#8)
// ----------------------------------------------------------------------------
// Filters a local list instantly as the user types — no per-keystroke backend
// query. Pass `items` and optionally `getLabel` for object arrays.
// ============================================================================

export function SearchAutocomplete<T>({
  items,
  getLabel = (x) => String(x),
  onSelect,
  placeholder = 'ابحث...',
}: {
  items: T[]
  getLabel?: (item: T) => string
  onSelect?: (item: T) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return items.filter((it) => getLabel(it).toLowerCase().includes(q)).slice(0, 6)
  }, [items, getLabel, query])

  const choose = (item: T) => {
    onSelect?.(item)
    setQuery(getLabel(item))
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!matches.length) return
            if (e.key === 'ArrowDown') setActive((a) => (a + 1) % matches.length)
            if (e.key === 'ArrowUp') setActive((a) => (a - 1 + matches.length) % matches.length)
            if (e.key === 'Enter') choose(matches[active])
          }}
          placeholder={placeholder}
          className="input-base py-2.5 pr-10 text-sm"
        />
      </div>

      {open && matches.length > 0 && (
        <ul className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
          {matches.map((it, i) => (
            <li key={i}>
              <button
                onMouseDown={() => choose(it)}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-right text-sm transition',
                  i === active ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-white/5',
                )}
              >
                <span>{getLabel(it)}</span>
                {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
