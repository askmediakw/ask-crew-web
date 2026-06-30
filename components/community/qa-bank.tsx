'use client'

import { useMemo, useState } from 'react'
import { Search, Copy, Check, Plus, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'

type CannedResponse = {
  id: string
  category: string
  question: string
  answer: string
}

// Mock library of canned admin responses / FAQ answers. Until the backend
// streams the real macro library, these are illustrative.
// TODO: BACKEND — replace with GET /support/canned-responses.
const QA_RESPONSES: CannedResponse[] = [
  {
    id: 'qa-1',
    category: 'الاشتراكات',
    question: 'كيف أرقّي باقتي إلى VIP؟',
    answer:
      'يمكنك ترقية باقتك من صفحة «الاشتراكات» داخل لوحة التحكم، ثم اختيار باقة VIP والضغط على «ترقية». سيتم احتساب الفرق تلقائياً حسب المدة المتبقية.',
  },
  {
    id: 'qa-2',
    category: 'المدفوعات',
    question: 'لم تتم معالجة الدفع عبر K-NET',
    answer:
      'نعتذر عن هذا الإزعاج. يُرجى التأكد من رصيد البطاقة وتفعيل الدفع الإلكتروني. إذا استمرت المشكلة، أعد المحاولة بعد دقائق أو استخدم بطاقة أخرى، ولا تتردد في التواصل معنا.',
  },
  {
    id: 'qa-3',
    category: 'التحقق (KYC)',
    question: 'كم يستغرق التحقق من الهوية؟',
    answer:
      'تتم مراجعة مستندات التحقق خلال 24-48 ساعة عمل. ستصلك إشعار فور اكتمال المراجعة. تأكد من وضوح الصورة وصلاحية الوثيقة لتسريع العملية.',
  },
  {
    id: 'qa-4',
    category: 'العقود',
    question: 'كيف أوقّع العقد رقمياً؟',
    answer:
      'افتح العقد من قسم «العقود»، انتقل إلى تبويب «التوقيع الرقمي»، ارسم توقيعك في المساحة المخصصة ثم اضغط «اعتماد التوقيع». سيُحفظ العقد موقّعاً مع ختم زمني.',
  },
  {
    id: 'qa-5',
    category: 'المحفظة',
    question: 'متى تُحوّل أرباحي إلى حسابي البنكي؟',
    answer:
      'بعد طلب السحب، تُحوّل الأموال المتاحة خلال 1-3 أيام عمل إلى حسابك البنكي المسجّل. الأموال المعلّقة في الضمان تُفرَج عنها بعد اكتمال العقد.',
  },
  {
    id: 'qa-6',
    category: 'الدعم',
    question: 'كيف أفتح تذكرة دعم؟',
    answer:
      'يمكنك فتح تذكرة من قسم «التذاكر والدعم» بالضغط على «تذكرة جديدة»، ثم وصف المشكلة بالتفصيل وإرفاق أي صور إن لزم. سيتواصل معك فريق الدعم في أقرب وقت.',
  },
]

function ResponseCard({
  item,
  onInsert,
}: {
  item: CannedResponse
  onInsert?: (text: string) => void
}) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.answer)
      setCopied(true)
      toast.success('تم نسخ الرد الجاهز')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white/5 p-4">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
          {item.category}
        </span>
        <h4 className="text-sm font-bold text-foreground">{item.question}</h4>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{item.answer}</p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-[11px] font-bold text-foreground transition hover:bg-white/10"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'تم النسخ' : 'نسخ الرد'}
        </button>
        {onInsert && (
          <button
            onClick={() => onInsert(item.answer)}
            className="flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-[11px] font-bold text-primary transition hover:bg-primary/25"
          >
            <Plus className="h-3.5 w-3.5" />
            إدراج في الرد
          </button>
        )}
      </div>
    </div>
  )
}

/** Modal body: searchable list of canned responses with copy / insert. */
export function QABankModal({ onInsert }: { onInsert?: (text: string) => void }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return QA_RESPONSES
    return QA_RESPONSES.filter(
      (r) =>
        r.question.toLowerCase().includes(q) ||
        r.answer.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث في بنك الأسئلة..."
          className="w-full rounded-xl border border-border bg-secondary py-2.5 pr-10 pl-4 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      <div className="max-h-[55vh] space-y-3 overflow-y-auto pl-1 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">لا توجد نتائج مطابقة لبحثك.</p>
        ) : (
          filtered.map((item) => <ResponseCard key={item.id} item={item} onInsert={onInsert} />)
        )}
      </div>
    </div>
  )
}

/** Tab panel shown under "بنك الأسئلة" — summary + button to open the modal. */
export function QABankPanel() {
  const { openModal } = useModal()

  const open = () =>
    openModal({
      title: 'بنك الأسئلة والردود الجاهزة',
      content: <QABankModal />,
      size: 'lg',
    })

  return (
    <div className="glass rounded-2xl border border-border p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <HelpCircle className="h-5 w-5 text-primary" />
            بنك الأسئلة والردود الجاهزة
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            ردود معتمدة يمكن للمشرف نسخها أو إدراجها مباشرة في المحادثات. ({QA_RESPONSES.length} رد جاهز)
          </p>
        </div>
        <button
          onClick={open}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90"
        >
          <HelpCircle className="h-4 w-4" />
          فتح بنك الأسئلة
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {QA_RESPONSES.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={open}
            className={cn(
              'rounded-xl border border-border/60 bg-white/5 p-4 text-right transition hover:border-primary/40 hover:bg-white/10',
            )}
          >
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
              {item.category}
            </span>
            <h4 className="mt-2 text-sm font-bold text-foreground">{item.question}</h4>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.answer}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
