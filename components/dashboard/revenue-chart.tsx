'use client'

import { useMemo, useState } from 'react'
import { type DashboardStatsType } from '@/lib/api'

type Datum = { label: string; value: number }

const RANGES: { id: 'weekly' | 'monthly' | 'quarterly' | 'annual'; label: string }[] = [
  { id: 'weekly', label: 'أسبوعي' },
  { id: 'monthly', label: 'شهري' },
  { id: 'quarterly', label: 'ربعي' },
  { id: 'annual', label: 'سنوي' },
]

const RANGE_SUBTITLE: Record<'weekly' | 'monthly' | 'quarterly' | 'annual', string> = {
  weekly: 'نمو المبيعات خلال آخر 7 أيام (د.ك)',
  monthly: 'نمو المبيعات خلال آخر 12 شهراً (بالألف د.ك)',
  quarterly: 'نمو المبيعات خلال أرباع السنة (بالألف د.ك)',
  annual: 'نمو المبيعات خلال آخر 6 سنوات (بالألف د.ك)',
}

const W = 1000
const H = 320
const PAD_Y = 24

interface RevenueChartProps {
  data?: DashboardStatsType | null
}

export function RevenueChart({ data: dashboardData }: RevenueChartProps) {
  const [range, setRange] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('weekly')
  const [hover, setHover] = useState<number | null>(null)

  // Fallback mock data for other time ranges
  const getMockData = (rangeType: string): Datum[] => {
    switch (rangeType) {
      case 'monthly':
        return [
          { label: 'يناير', value: 18 },
          { label: 'فبراير', value: 26 },
          { label: 'مارس', value: 22 },
          { label: 'أبريل', value: 34 },
          { label: 'مايو', value: 40 },
          { label: 'يونيو', value: 31 },
          { label: 'يوليو', value: 48 },
          { label: 'أغسطس', value: 44 },
          { label: 'سبتمبر', value: 57 },
          { label: 'أكتوبر', value: 52 },
          { label: 'نوفمبر', value: 64 },
          { label: 'ديسمبر', value: 69 },
        ]
      case 'quarterly':
        return [
          { label: 'الربع الأول', value: 66 },
          { label: 'الربع الثاني', value: 105 },
          { label: 'الربع الثالث', value: 149 },
          { label: 'الربع الرابع', value: 185 },
        ]
      case 'annual':
        return [
          { label: '2021', value: 142 },
          { label: '2022', value: 218 },
          { label: '2023', value: 305 },
          { label: '2024', value: 396 },
          { label: '2025', value: 505 },
          { label: '2026', value: 612 },
        ]
      default:
        return []
    }
  }

  let data: Datum[]
  if (range === 'weekly' && dashboardData) {
    data = dashboardData.revenue_chart.labels.map((label, index) => ({
      label,
      value: dashboardData.revenue_chart.data[index],
    }))
  } else {
    data = getMockData(range)
  }

  const { line, area, points } = useMemo(() => {
    if (data.length === 0) {
      return { line: '', area: '', points: [] }
    }
    const max = Math.max(...data.map((m) => m.value)) * 1.1 || 1
    const stepX = W / (data.length - 1)
    const pts = data.map((m, i) => {
      const x = i * stepX
      const y = H - PAD_Y - (m.value / max) * (H - PAD_Y * 2)
      return { x, y, ...m }
    })
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y.toFixed(1)}`).join(' ')
    const area = `${line} L${W},${H} L0,${H} Z`
    return { line, area, points: pts }
  }, [data])

  return (
    <section className="overflow-hidden rounded-2xl border border-border glass p-5 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">تحليل الإيرادات</h2>
          <p className="text-sm text-muted-foreground">{RANGE_SUBTITLE[range]}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-white/5 p-1 text-sm">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRange(r.id)
                setHover(null)
              }}
              aria-pressed={range === r.id}
              className={
                range === r.id
                  ? 'rounded-lg bg-primary px-3 py-1.5 font-semibold text-primary-foreground'
                  : 'rounded-lg px-3 py-1.5 text-muted-foreground transition hover:text-foreground'
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-72 w-full">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
              <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1="0"
              x2={W}
              y1={H * g}
              y2={H * g}
              stroke="currentColor"
              strokeWidth="1"
              className="text-border"
            />
          ))}

          {/* key on range so the path fades in smoothly when switching timeframe */}
          <g key={range} className="duration-500 animate-in fade-in">
            <path d={area} fill="url(#revFill)" />
            <path
              d={line}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: 'drop-shadow(0 0 8px color-mix(in oklch, var(--primary) 70%, transparent))' }}
            />
          </g>

          {/* hover hit areas + markers */}
          {points.map((p, i) => (
            <g key={i}>
              <rect
                x={p.x - W / data.length / 2}
                y={0}
                width={W / data.length}
                height={H}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
              {hover === i && (
                <>
                  <line x1={p.x} x2={p.x} y1={0} y2={H} stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx={p.x} cy={p.y} r="7" fill="var(--accent)" />
                  <circle cx={p.x} cy={p.y} r="12" fill="var(--accent)" opacity="0.25" />
                </>
              )}
            </g>
          ))}
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-center shadow-xl"
            style={{
              right: `${(points[hover].x / W) * 100}%`,
              top: `${(points[hover].y / H) * 100}%`,
              transform: 'translate(50%, -130%)',
            }}
          >
            <p className="text-[11px] text-muted-foreground">{data[hover].label}</p>
            <p className="font-mono text-sm font-bold text-foreground">
              {data[hover].value.toFixed(1)} د.ك
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex justify-between px-1 text-[11px] text-muted-foreground">
        {data
          .filter((_, i) => (data.length > 6 ? i % 2 === 0 : true))
          .map((m) => (
            <span key={m.label}>{m.label}</span>
          ))}
      </div>
    </section>
  )
}
