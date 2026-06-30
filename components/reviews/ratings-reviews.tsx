'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/lib/toast'

// #43 — Ratings & reviews. A star summary with a 5→1 distribution, a list of
// written reviews, and a submit form (interactive star picker + comment).
// Data is mock/local (TODO: BACKEND — GET/POST /api/reviews?profileId=).
type Review = {
  id: string
  author: string
  role: string
  rating: number
  date: string
  comment: string
}

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', author: 'استوديو الخليج', role: 'شركة إنتاج', rating: 5, date: '2026-06-10', comment: 'احترافية عالية والتزام تام بالمواعيد. تعاون مميز في مشروع المسلسل.' },
  { id: 'r2', author: 'منى العلي', role: 'مخرجة', rating: 4, date: '2026-05-28', comment: 'عمل ممتاز وجودة تصوير رائعة، مع بعض التأخير البسيط في التسليم النهائي.' },
  { id: 'r3', author: 'شركة أفق', role: 'وكالة إعلانات', rating: 5, date: '2026-05-15', comment: 'من أفضل من تعاملنا معهم. إبداع وسرعة في التنفيذ.' },
]

function Stars({ value, size = 16, onSelect }: { value: number; size?: number; onSelect?: (v: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover ?? value) >= n
        return (
          <button
            key={n}
            type="button"
            disabled={!onSelect}
            onClick={() => onSelect?.(n)}
            onMouseEnter={() => onSelect && setHover(n)}
            onMouseLeave={() => onSelect && setHover(null)}
            className={cn(onSelect ? 'cursor-pointer' : 'cursor-default')}
            aria-label={`${n} نجوم`}
          >
            <Star
              style={{ width: size, height: size }}
              className={cn(active ? 'fill-warning text-warning' : 'text-muted-foreground/40')}
            />
          </button>
        )
      })}
    </div>
  )
}

export function RatingsReviews({ profileName }: { profileName?: string }) {
  const { toast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  const submit = () => {
    if (rating === 0) {
      toast.error('اختر تقييماً بالنجوم أولاً')
      return
    }
    const next: Review = {
      id: `r${Date.now()}`,
      author: 'أنت',
      role: 'عميل',
      rating,
      date: new Date().toISOString().slice(0, 10),
      comment: comment.trim() || 'بدون تعليق',
    }
    setReviews((prev) => [next, ...prev])
    setRating(0)
    setComment('')
    toast.success('تم نشر تقييمك. شكراً لك!')
  }

  return (
    <div className="space-y-5">
      <h4 className="text-sm font-bold text-foreground">
        التقييمات والمراجعات{profileName ? ` — ${profileName}` : ''}
      </h4>

      {/* Summary */}
      <div className="grid gap-5 rounded-xl border border-border bg-white/5 p-5 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-1 sm:border-l sm:border-border sm:pl-5">
          <span className="text-4xl font-black text-foreground">{avg.toFixed(1)}</span>
          <Stars value={Math.round(avg)} />
          <span className="text-xs text-muted-foreground">{reviews.length} مراجعة</span>
        </div>
        <div className="space-y-1.5">
          {dist.map((d) => {
            const pct = reviews.length ? (d.count / reviews.length) * 100 : 0
            return (
              <div key={d.star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-muted-foreground">{d.star}</span>
                <Star className="h-3 w-3 fill-warning text-warning" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-left tabular-nums text-muted-foreground">{d.count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit form */}
      <div className="rounded-xl border border-border p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">أضف تقييمك:</p>
        <Stars value={rating} size={24} onSelect={setRating} />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="اكتب تجربتك مع هذا المستقل..."
          className="input-base mt-3 resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={submit}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            نشر التقييم
          </button>
        </div>
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-white/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-foreground">{r.author}</p>
                <p className="text-[11px] text-muted-foreground">{r.role}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Stars value={r.rating} size={14} />
                <span className="text-[11px] tabular-nums text-muted-foreground">{r.date}</span>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
