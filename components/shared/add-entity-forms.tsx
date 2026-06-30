'use client'

import { useState, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import { GeoBlockingControl } from '@/components/shared/geo-widgets'

// ============================================================================
// Reusable "create new" modal forms used across the dashboard's green + buttons.
// Each form manages its own local state and, on save, fires a success toast and
// closes the modal. The actual API wiring is left to the backend (marked TODO).
// Open them via: openModal({ title, content: <CmsUploadForm /> })
// ============================================================================

function FormShell({
  children,
  onSave,
  saveLabel = 'حفظ',
  saveClass = 'bg-primary text-primary-foreground',
  disabled,
}: {
  children: ReactNode
  onSave: () => void
  saveLabel?: string
  saveClass?: string
  disabled?: boolean
}) {
  const { closeModal } = useModal()
  return (
    <div>
      <div className="space-y-4">{children}</div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={closeModal}
          className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10"
        >
          إلغاء
        </button>
        <button
          onClick={onSave}
          disabled={disabled}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${saveClass}`}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-muted-foreground">{children}</label>
}

// ---------------------------------------------------------------- CMS upload
export function CmsUploadForm() {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [type, setType] = useState('')
  const [title, setTitle] = useState('')
  const [fileName, setFileName] = useState('')
  const [desc, setDesc] = useState('')

  const save = () => {
    // TODO: BACKEND — POST content metadata + uploaded file to the CMS API.
    toast.success(`تم نشر المحتوى: ${title}`)
    closeModal()
  }

  return (
    <FormShell onSave={save} saveLabel="حفظ ونشر" saveClass="bg-success text-white" disabled={!title.trim() || !type}>
      <div>
        <FieldLabel>نوع المحتوى</FieldLabel>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base">
          <option value="" className="bg-popover">اختر نوع المحتوى...</option>
          <option value="movie" className="bg-popover">فيلم قصير</option>
          <option value="series" className="bg-popover">مسلسل</option>
          <option value="promo" className="bg-popover">إعلان ترويجي</option>
          <option value="documentary" className="bg-popover">وثائقي</option>
        </select>
      </div>
      <div>
        <FieldLabel>عنوان العمل</FieldLabel>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="مثال: ظل الصحراء" />
      </div>
      <div>
        <FieldLabel>ملف الفيديو</FieldLabel>
        <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-border p-6 text-center transition hover:bg-white/5">
          <UploadCloud className="mb-2 h-7 w-7 text-primary" />
          <span className="text-sm font-medium text-primary">
            {fileName || 'اضغط لرفع الفيديو (MP4, MOV)'}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">الحد الأقصى للملف 2GB</span>
          <input
            type="file"
            accept="video/mp4,video/quicktime"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
          />
        </label>
      </div>
      <div>
        <FieldLabel>وصف العمل</FieldLabel>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input-base h-24 resize-none" placeholder="وصف العمل والقصة..." />
      </div>
      <GeoBlockingControl />
    </FormShell>
  )
}

// ---------------------------------------------------------------- Chat room
export function ChatRoomForm() {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState('public')

  const save = () => {
    // TODO: BACKEND — create a new chat room with the chosen visibility.
    toast.success(`تم إنشاء غرفة: ${name}`)
    closeModal()
  }

  return (
    <FormShell onSave={save} saveLabel="إنشاء الغرفة" disabled={!name.trim()}>
      <div>
        <FieldLabel>اسم الغرفة</FieldLabel>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="مثال: نقاشات صناع الأفلام" />
      </div>
      <div>
        <FieldLabel>نوع الغرفة</FieldLabel>
        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="input-base">
          <option value="public" className="bg-popover">عامة (لجميع المشتركين)</option>
          <option value="private" className="bg-popover">خاصة (للمحترفين فقط)</option>
          <option value="cast" className="bg-popover">طاقم عمل مشروع محدد</option>
        </select>
      </div>
    </FormShell>
  )
}

// ---------------------------------------------------------------- Workshop
export function WorkshopForm() {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [trainer, setTrainer] = useState('')
  const [link, setLink] = useState('')

  const save = () => {
    // TODO: BACKEND — schedule the workshop and notify subscribers.
    toast.success(`تم جدولة الورشة: ${title}`)
    closeModal()
  }

  return (
    <FormShell onSave={save} saveLabel="جدولة الورشة" disabled={!title.trim()}>
      <div>
        <FieldLabel>عنوان الورشة</FieldLabel>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="مثال: أساسيات الإخراج" />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <FieldLabel>التاريخ</FieldLabel>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-base" />
        </div>
        <div className="flex-1">
          <FieldLabel>الوقت</FieldLabel>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input-base" />
        </div>
      </div>
      <div>
        <FieldLabel>اسم المحاضر</FieldLabel>
        <input value={trainer} onChange={(e) => setTrainer(e.target.value)} className="input-base" placeholder="اسم المحاضر..." />
      </div>
      <div>
        <FieldLabel>رابط الورشة</FieldLabel>
        <input type="url" dir="ltr" value={link} onChange={(e) => setLink(e.target.value)} className="input-base text-left" placeholder="Zoom / Google Meet link" />
      </div>
    </FormShell>
  )
}

// ---------------------------------------------------------------- Job posting
export function JobForm() {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('freelance')
  const [desc, setDesc] = useState('')

  const save = () => {
    // TODO: BACKEND — publish the job posting to the careers board.
    toast.success(`تم نشر الوظيفة: ${title}`)
    closeModal()
  }

  return (
    <FormShell onSave={save} saveLabel="نشر الوظيفة" saveClass="bg-success text-white" disabled={!title.trim()}>
      <div>
        <FieldLabel>عنوان الوظيفة</FieldLabel>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="مثال: مطلوب محرر فيديو" />
      </div>
      <div>
        <FieldLabel>نوع التعاقد</FieldLabel>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input-base">
          <option value="freelance" className="bg-popover">عمل حر (Freelance)</option>
          <option value="contract" className="bg-popover">عقد مؤقت</option>
          <option value="fulltime" className="bg-popover">دوام كامل</option>
        </select>
      </div>
      <div>
        <FieldLabel>وصف الوظيفة</FieldLabel>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className="input-base h-24 resize-none" placeholder="المهام والمتطلبات..." />
      </div>
    </FormShell>
  )
}

// ---------------------------------------------------------------- Promo code
export function PromoCodeForm() {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [code, setCode] = useState('')
  const [percent, setPercent] = useState('')
  const [expiry, setExpiry] = useState('')

  const save = () => {
    // TODO: BACKEND — register the discount code with its validity window.
    toast.success(`تم تفعيل كود الخصم: ${code.toUpperCase()}`)
    closeModal()
  }

  return (
    <FormShell onSave={save} saveLabel="تفعيل الكود" disabled={!code.trim() || !percent}>
      <div>
        <FieldLabel>كود الخصم</FieldLabel>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="input-base text-center font-bold uppercase tracking-widest"
          placeholder="VIP2026"
        />
      </div>
      <div>
        <FieldLabel>نسبة الخصم</FieldLabel>
        <div className="flex items-center overflow-hidden rounded-xl border border-border bg-white/5 focus-within:border-primary">
          <span className="bg-secondary px-4 py-3 font-bold text-muted-foreground">%</span>
          <input
            type="number"
            min={1}
            max={100}
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="w-full bg-transparent px-3 py-3 text-foreground outline-none"
            placeholder="مثال: 20"
          />
        </div>
      </div>
      <div>
        <FieldLabel>صالح حتى تاريخ</FieldLabel>
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="input-base" />
      </div>
    </FormShell>
  )
}
