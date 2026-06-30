'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  CreditCard,
  Building2,
  Users,
  CornerDownLeft,
  Sparkles,
} from 'lucide-react'

type Command = {
  label: string
  hint: string
  icon: typeof Search
  action: (router: ReturnType<typeof useRouter>) => void
  accent: string
}

const commands: Command[] = [
  {
    label: 'إضافة باقة جديدة (VIP)',
    hint: 'الاشتراكات',
    icon: CreditCard,
    accent: 'text-primary',
    action: (r) => r.push('/dashboard/packages'),
  },
  {
    label: 'إدارة باقات الاشتراك',
    hint: 'الاشتراكات',
    icon: CreditCard,
    accent: 'text-accent',
    action: (r) => r.push('/dashboard/packages'),
  },
  {
    label: 'تفعيل شركات الإنتاج المعلّقة',
    hint: 'الشركات',
    icon: Building2,
    accent: 'text-[var(--success)]',
    action: (r) => r.push('/dashboard/companies'),
  },
  {
    label: 'عرض لوحة المستخدمين',
    hint: 'المستخدمين',
    icon: Users,
    accent: 'text-[var(--gold)]',
    action: (r) => r.push('/dashboard/users'),
  },
]

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const filtered = useMemo(
    () => commands.filter((c) => c.label.includes(query) || c.hint.includes(query)),
    [query],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl glow-brand">
        <div className="flex items-center gap-3 border-b border-border px-5">
          <Search className="h-5 w-5 text-primary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن شركة، باقة، أو إجراء..."
            className="w-full bg-transparent py-5 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-3 scrollbar-thin">
          <div className="mb-2 flex items-center gap-2 px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            اقتراحات سريعة
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              لا توجد نتائج مطابقة
            </p>
          ) : (
            filtered.map((c) => {
              const Icon = c.icon
              return (
                <button
                  key={c.label}
                  onClick={() => {
                    c.action(router)
                    onClose()
                  }}
                  className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition hover:bg-primary/15"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                    <Icon className={`h-4.5 w-4.5 ${c.accent}`} />
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground">{c.label}</span>
                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground">
                    {c.hint}
                  </span>
                  <CornerDownLeft className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
