'use client'

import { useRef, useState } from 'react'
import { PenLine, Upload, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// #32 — Digital signature capture. Two modes:
//   - "type"   : the user types their name, rendered in a cursive web font.
//   - "upload" : the user uploads a signature image.
// An "Accept terms" checkbox gates the confirm button. Calls onSign with the
// captured signature payload (TODO: BACKEND — persist + hash for audit trail).
type Mode = 'type' | 'upload'

export function DigitalSignature({
  onSign,
}: {
  onSign?: (sig: { mode: Mode; value: string; accepted: boolean }) => void
}) {
  const [mode, setMode] = useState<Mode>('type')
  const [typed, setTyped] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [signed, setSigned] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const canSign = accepted && (mode === 'type' ? typed.trim().length > 1 : Boolean(imageUrl))

  const handleImage = (file?: File) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const confirm = () => {
    if (!canSign) return
    setSigned(true)
    onSign?.({ mode, value: mode === 'type' ? typed.trim() : (imageUrl ?? ''), accepted })
  }

  if (signed) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/40 bg-success/10 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-success/20 text-success">
          <Check className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-foreground">تم توقيع العقد بنجاح</p>
          <p className="text-xs text-muted-foreground">
            {mode === 'type' ? `وقّع باسم: ${typed.trim()}` : 'تم رفع صورة التوقيع'} • مُوثّق بالطابع الزمني
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Mode switch */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('type')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition',
            mode === 'type'
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
          )}
        >
          <PenLine className="h-4 w-4" />
          كتابة الاسم
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition',
            mode === 'upload'
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
          )}
        >
          <Upload className="h-4 w-4" />
          رفع صورة توقيع
        </button>
      </div>

      {/* Signature surface */}
      {mode === 'type' ? (
        <div className="space-y-2">
          <div
            className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-white/5"
            aria-live="polite"
          >
            <span
              className="text-3xl text-foreground"
              style={{ fontFamily: '"Brush Script MT", "Segoe Script", cursive' }}
            >
              {typed.trim() || 'توقيعك هنا'}
            </span>
          </div>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="اكتب اسمك الكامل"
            className="w-full rounded-lg border border-border bg-white/5 px-4 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 placeholder:text-muted-foreground"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-white/5 transition hover:border-primary/50"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="معاينة التوقيع" className="max-h-20 object-contain" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-muted-foreground">
                <Upload className="h-6 w-6" />
                <span className="text-xs">اضغط لرفع صورة التوقيع</span>
              </span>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl(null)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-destructive"
            >
              <X className="h-3 w-3" />
              إزالة الصورة
            </button>
          )}
        </div>
      )}

      {/* Accept terms */}
      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-white/5 p-3">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-primary"
        />
        <span className="text-xs leading-relaxed text-muted-foreground">
          أوافق على الشروط والأحكام الخاصة بهذا العقد وأقر بأن هذا التوقيع الرقمي ملزم قانونياً.
        </span>
      </label>

      <button
        type="button"
        onClick={confirm}
        disabled={!canSign}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
      >
        <Check className="h-4 w-4" />
        توقيع واعتماد العقد
      </button>
    </div>
  )
}
