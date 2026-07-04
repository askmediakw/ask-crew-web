'use client'

import { useState } from 'react'
import { Trophy, Crown, Minus, ArrowUp, ArrowDown, BadgeCheck, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeaderboardCategory, LeaderboardEntry, DashboardStatsType } from '@/lib/api'

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: 'freelancers', label: 'المحترفون' },
  { key: 'assets', label: 'الأصول' },
  { key: 'projects', label: 'المشاريع' },
]

const rankBadge = (rank: number) => {
  if (rank === 1) return 'bg-gold/20 text-gold ring-1 ring-gold/40'
  if (rank === 2) return 'bg-white/15 text-foreground ring-1 ring-white/20'
  if (rank === 3) return 'bg-accent/15 text-accent ring-1 ring-accent/30'
  return 'bg-white/5 text-muted-foreground'
}

function Trend({ trend }: { trend: number }) {
  if (trend === 0)
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
      </span>
    )
  const up = trend > 0
  return (
    <span className={cn('flex items-center gap-0.5 text-xs font-bold', up ? 'text-success' : 'text-destructive')}>
      {up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(trend)}
    </span>
  )
}

interface LeaderboardProps {
  defaultCategory?: LeaderboardCategory
  data?: DashboardStatsType['leaderboard']
}

export function Leaderboard({ defaultCategory = 'freelancers', data }: LeaderboardProps) {
  const [category, setCategory] = useState<LeaderboardCategory>(defaultCategory)

  // Fallback mock data if no data is provided
  const entries: LeaderboardEntry[] = data && data[category] && data[category].length > 0
    ? data[category]
    : [
        {
          rank: 1,
          name: "أحمد الخالد",
          subtitle: "الرياض, السعودية",
          verified: true,
          score: 95,
          metricLabel: "45 منجز",
          trend: 2,
        },
        {
          rank: 2,
          name: "سارة العتيبي",
          subtitle: "جدة, السعودية",
          verified: true,
          score: 88,
          metricLabel: "38 منجز",
          trend: -1,
        },
        {
          rank: 3,
          name: "محمد الحربي",
          subtitle: "الدمام, السعودية",
          verified: false,
          score: 82,
          metricLabel: "32 منجز",
          trend: 0,
        },
      ]

  return (
    <div className="glass overflow-hidden rounded-2xl border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Trophy className="h-5 w-5 text-gold" />
          المتصدرون — Top 10
        </h3>
        <div className="flex rounded-lg bg-white/5 p-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-bold transition',
                category === c.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border/60">
        {entries.map((e) => (
          <li key={e.rank} className="flex items-center gap-3 p-4 transition hover:bg-white/5">
            <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black', rankBadge(e.rank))}>
              {e.rank === 1 ? <Crown className="h-4 w-4" /> : e.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-bold text-foreground">{e.name}</p>
                {e.verified && <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-accent" />}
              </div>
              <p className="truncate text-xs text-muted-foreground">{e.subtitle}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full rounded-full bg-gold/70" style={{ width: `${e.score}%` }} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-xs font-bold text-foreground">{e.metricLabel}</span>
              <Trend trend={e.trend} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
