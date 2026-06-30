'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LayoutTemplate, Plus, ImagePlus, Star, Trash2, Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import { CmsUploadForm } from '@/components/shared/add-entity-forms'
import { EmptyState } from '@/components/shared/empty-state'
import { SubtitlesButton } from '@/components/shared/geo-widgets'

const FILTERS = ['كل المحتوى', 'أفلام', 'مسلسلات', 'لافتات (Banners)', 'إعلانات', 'التقييمات']

const content = [
  { title: 'ظل الصحراء', type: 'فيلم قصير', views: '12,450', rating: '4.8', status: 'منشور', tone: 'success' as const, img: '/posters/desert-storm.png' },
  { title: 'الإمبراطورية العظمى', type: 'مسلسل', views: '48,900', rating: '4.9', status: 'منشور', tone: 'success' as const, img: '/posters/great-empire.png' },
  { title: 'إعلان عرض الصيف', type: 'إعلان ترويجي', views: '85,200', rating: '-', status: 'مجدول', tone: 'info' as const, img: '/posters/future-tech.png' },
  { title: 'نشأة آسك كرو', type: 'وثائقي', views: '6,310', rating: '4.6', status: 'مسودة', tone: 'muted' as const, img: '/posters/ask-crew-origin.png' },
]

const toneClass: Record<string, string> = {
  success: 'bg-success/20 text-success',
  info: 'bg-accent/20 text-accent',
  muted: 'bg-white/10 text-muted-foreground',
}

// Maps a filter tab to the content "type" values it should show.
function matchesFilter(type: string, filterIndex: number) {
  switch (FILTERS[filterIndex]) {
    case 'كل المحتوى':
      return true
    case 'أفلام':
      return type.includes('فيلم')
    case 'مسلسلات':
      return type.includes('مسلسل')
    case 'لافتات (Banners)':
      return type.includes('لافتة') || type.includes('بانر')
    case 'إعلانات':
      return type.includes('إعلان')
    case 'التقييمات':
      return type.includes('تقييم')
    default:
      return true
  }
}

export function ContentView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const { toast } = useToast()
  const [filter, setFilter] = useState(0)
  const [selected, setSelected] = useState<string[]>([])
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const filtered = content.filter((c) => matchesFilter(c.type, filter))

  const toggleRow = (title: string) =>
    setSelected((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.title))
  const toggleAll = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((c) => c.title))

  const bulkDelete = () => {
    toast.success(`تم حذف ${selected.length} عنصر`)
    setSelected([])
  }
  const bulkPublish = () => {
    toast.success(`تم إرسال أمر نشر ${selected.length} عنصر`)
    setSelected([])
  }
  const generateTags = () => {
    toast.info('جاري تحليل المحتوى وتوليد الوسوم بالذكاء الاصطناعي...')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <LayoutTemplate className={cn('h-6 w-6', accent)} />
            إدارة المحتوى (CMS)
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">الأفلام، المسلسلات، اللافتات، والإعلانات الترويجية.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal({ title: 'إضافة لافتة جديدة', content: <CmsUploadForm /> })}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/15"
          >
            <ImagePlus className="h-4 w-4" />
            إضافة لافتة
          </button>
          <button
            onClick={() => openModal({ title: 'رفع محتوى جديد', content: <CmsUploadForm /> })}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            رفع محتوى جديد
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
        {FILTERS.map((f, i) => (
          <button
            key={f}
            onClick={() => setFilter(i)}
            className={cn(
              'whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition',
              i === filter
                ? execMode
                  ? 'bg-destructive text-white'
                  : 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bulk action toolbar — appears only when rows are selected */}
      {selected.length > 0 && (
        <div className="glass flex w-fit items-center gap-3 rounded-2xl border border-border p-2 animate-slide-up">
          <span className="px-2 text-xs font-bold text-muted-foreground">
            {selected.length} محدد
          </span>
          <button
            onClick={bulkDelete}
            className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
            حذف المجمع
          </button>
          <button
            onClick={bulkPublish}
            className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-2 text-sm font-medium text-success transition hover:bg-success hover:text-white"
          >
            <Send className="h-4 w-4" />
            نشر الكل
          </button>
          <button
            onClick={generateTags}
            className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
          >
            <Sparkles className="h-4 w-4" />
            توليد وسوم AI
          </button>
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={LayoutTemplate}
                title="لا يوجد محتوى"
                description="لا توجد عناصر مطابقة لهذا التصنيف بعد."
              />
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-right text-sm">
              <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      aria-label="تحديد الكل"
                      className="h-4 w-4 cursor-pointer accent-primary"
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">العمل / المحتوى</th>
                  <th className="px-5 py-4 font-semibold">النوع</th>
                  <th className="px-5 py-4 font-semibold">المشاهدات</th>
                  <th className="px-5 py-4 font-semibold">التقييم</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isSelected = selected.includes(c.title)
                  return (
                    <tr
                      key={c.title}
                      className={cn(
                        'border-b border-border/60 transition last:border-0 hover:bg-white/5',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(c.title)}
                          aria-label={`تحديد ${c.title}`}
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-secondary">
                            <Image src={c.img || "/placeholder.svg"} alt={c.title} fill className="object-cover" sizes="36px" />
                          </div>
                          <span className="font-bold text-foreground">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{c.type}</td>
                      <td className="px-5 py-4 text-foreground">{c.views}</td>
                      <td className="px-5 py-4">
                        {c.rating === '-' ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <span className="flex items-center gap-1 text-gold">
                            <Star className="h-3.5 w-3.5 fill-gold" />
                            {c.rating}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', toneClass[c.tone])}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {c.type.includes('فيلم') || c.type.includes('مسلسل') ? (
                          <SubtitlesButton
                            onClick={() => toast.success(`تم إرسال طلب ترجمة: ${c.title}`)}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>

                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
