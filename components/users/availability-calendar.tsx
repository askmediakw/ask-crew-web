'use client'

import { cn } from '@/lib/utils'

const WEEKDAYS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

/**
 * Premium mini availability calendar for the current month.
 * - Available days: default/green-tinted, selectable.
 * - Booked days: red, disabled.
 * - Past days: muted, disabled.
 */
export function AvailabilityCalendar({
  month,
  bookedDates,
  selectedDate,
  onSelectDate,
}: {
  /** "yyyy-mm" of the month to render. */
  month: string
  bookedDates: string[]
  selectedDate: string | null
  onSelectDate: (iso: string) => void
}) {
  const [year, monthNum] = month.split('-').map(Number)
  const monthIndex = monthNum - 1
  const firstDay = new Date(year, monthIndex, 1)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const startWeekday = firstDay.getDay() // 0 = Sunday
  const booked = new Set(bookedDates)

  const today = new Date()
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const monthLabel = firstDay.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })

  const cells: (number | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-2xl border border-border bg-white/5 p-4">
      <p className="mb-3 text-center text-sm font-black text-foreground">{monthLabel}</p>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="text-center text-[10px] font-bold text-muted-foreground">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <span key={`empty-${i}`} />
          const iso = `${month}-${String(day).padStart(2, '0')}`
          const isBooked = booked.has(iso)
          const isPast = iso < todayIso
          const isSelected = selectedDate === iso
          const disabled = isBooked || isPast

          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(iso)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition',
                isSelected && 'bg-primary text-primary-foreground shadow-lg shadow-primary/30',
                !isSelected && isBooked && 'cursor-not-allowed bg-destructive/15 text-destructive line-through',
                !isSelected && isPast && !isBooked && 'cursor-not-allowed text-muted-foreground/40',
                !isSelected && !disabled && 'bg-success/10 text-success hover:bg-success/20',
              )}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success/40" />
          متاح
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive/40" />
          محجوز
        </span>
      </div>
    </div>
  )
}
