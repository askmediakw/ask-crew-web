'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import {
  Search,
  LayoutGrid,
  List,
  UploadCloud,
  Sparkles,
  Trash2,
  Send,
  CheckSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type PosterStatus = 'Published' | 'Draft' | 'Tagging'

type Poster = {
  id: number
  title: string
  genre: string
  resolution: '4K' | '8K' | 'HD'
  status: PosterStatus
  size: string
  selected: boolean
  img: string
}

const initialPosters: Poster[] = [
  {
    id: 1,
    title: 'The Great Empire',
    genre: 'أكشن',
    resolution: '4K',
    status: 'Published',
    size: '2.4 MB',
    selected: false,
    img: '/posters/great-empire.png',
  },
  {
    id: 2,
    title: 'Desert Storm',
    genre: 'وثائقي',
    resolution: 'HD',
    status: 'Draft',
    size: '1.1 MB',
    selected: false,
    img: '/posters/desert-storm.png',
  },
  {
    id: 3,
    title: 'Ask Crew Origin',
    genre: 'دراما',
    resolution: '8K',
    status: 'Published',
    size: '5.2 MB',
    selected: false,
    img: '/posters/ask-crew-origin.png',
  },
  {
    id: 4,
    title: 'Future Tech',
    genre: 'خيال علمي',
    resolution: '4K',
    status: 'Tagging',
    size: '3.0 MB',
    selected: false,
    img: '/posters/future-tech.png',
  },
]

function StatusBadge({ status }: { status: PosterStatus }) {
  if (status === 'Published')
    return <span className="text-[10px] font-bold text-[var(--success)]">منشور</span>
  if (status === 'Draft')
    return <span className="text-[10px] font-bold text-muted-foreground">مسودة</span>
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-accent">
      <Sparkles className="h-3 w-3 animate-pulse" />
      جاري المعالجة
    </span>
  )
}

export function PostersHub() {
  const { execMode } = useExecMode()
  const [posters, setPosters] = useState<Poster[]>(initialPosters)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [dragging, setDragging] = useState(false)

  const accentBg = execMode ? 'bg-destructive' : 'bg-primary'
  const accentText = execMode ? 'text-destructive' : 'text-primary'
  const accentBorder = execMode ? 'border-destructive' : 'border-primary'

  const filtered = useMemo(
    () =>
      posters.filter(
        (p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.genre.includes(search),
      ),
    [posters, search],
  )

  const selectedCount = posters.filter((p) => p.selected).length
  const allSelected = posters.length > 0 && posters.every((p) => p.selected)

  const toggleSelection = (id: number) =>
    setPosters((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)))

  const toggleAll = () =>
    setPosters((prev) => prev.map((p) => ({ ...p, selected: !allSelected })))

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">مكتبة البوسترات (Smart Hub)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة أكثر من 500,000 ملف ميديا مدعومة بالذكاء الاصطناعي
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن بوستر، مخرج، أو تصنيف..."
              className="input-base pr-10"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-xl border border-border bg-secondary/60 p-1">
            <button
              onClick={() => setView('grid')}
              aria-label="عرض شبكي"
              className={cn(
                'rounded-lg p-2 transition-all',
                view === 'grid'
                  ? cn(accentBg, 'text-white')
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="عرض قائمة"
              className={cn(
                'rounded-lg p-2 transition-all',
                view === 'list'
                  ? cn(accentBg, 'text-white')
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mass selection bar */}
      {selectedCount > 0 && (
        <div
          className={cn(
            'flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between',
            execMode
              ? 'border-destructive/50 bg-destructive/10'
              : 'border-primary/50 bg-primary/10',
          )}
        >
          <span className="px-2 text-sm font-bold text-foreground">
            تم تحديد ({selectedCount}) بوسترات
          </span>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-1.5 text-xs font-bold text-foreground transition hover:bg-white/20">
              <Sparkles className="h-3.5 w-3.5" />
              توليد وسوم AI
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/15 px-4 py-1.5 text-xs font-bold text-[var(--success)] transition hover:bg-[var(--success)]/30">
              <Send className="h-3.5 w-3.5" />
              نشر الكل
            </button>
            <button
              onClick={() => setPosters((prev) => prev.filter((p) => !p.selected))}
              className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/15 px-4 py-1.5 text-xs font-bold text-destructive transition hover:bg-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف المجمع
            </button>
          </div>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        className={cn(
          'rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300',
          dragging
            ? cn(accentBorder, execMode ? 'bg-destructive/10' : 'bg-primary/10', 'scale-[1.01]')
            : 'border-border bg-secondary/30 hover:bg-secondary/50',
        )}
      >
        <div
          className={cn(
            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            execMode ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary',
          )}
        >
          <UploadCloud className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-lg font-black text-foreground">اسحب وأفلت المجلدات هنا</h3>
        <p className="mx-auto mb-4 max-w-md text-sm text-muted-foreground">
          أو اضغط لتحديد الملفات (يدعم التحويل التلقائي لصيغة WebP لتسريع المنصة)
        </p>
        <button
          className={cn(
            'rounded-xl px-6 py-2 font-bold text-white shadow-lg transition-all hover:opacity-90',
            execMode ? 'bg-destructive glow-alert' : 'bg-primary glow-brand',
          )}
        >
          استعراض الملفات
        </button>
      </div>

      {/* Select all */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleAll}
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors',
            allSelected ? cn(accentBg, accentBorder) : 'border-border bg-transparent',
          )}
          aria-pressed={allSelected}
          aria-label="تحديد الكل"
        >
          {allSelected && <CheckSquare className="h-3.5 w-3.5" />}
        </button>
        <span className="text-sm font-bold text-muted-foreground">
          تحديد الكل لتطبيق اختبار أ/ب (A/B Test)
        </span>
      </div>

      {/* Posters */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">لا توجد بوسترات مطابقة</p>
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              : 'flex flex-col gap-3',
          )}
        >
          {filtered.map((poster) =>
            view === 'grid' ? (
              <button
                key={poster.id}
                onClick={() => toggleSelection(poster.id)}
                className={cn(
                  'group relative aspect-[2/3] overflow-hidden rounded-2xl border text-right transition-all duration-300',
                  poster.selected
                    ? cn(accentBorder, execMode ? 'glow-alert' : 'glow-brand', 'scale-[1.03]')
                    : 'border-white/5 hover:border-white/20',
                )}
              >
                <Image
                  src={poster.img || '/placeholder.svg'}
                  alt={poster.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover opacity-85 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <span
                  className={cn(
                    'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors',
                    poster.selected ? cn(accentBg, accentBorder) : 'border-white/40 bg-black/40',
                  )}
                >
                  {poster.selected && <CheckSquare className="h-3.5 w-3.5" />}
                </span>

                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <h4 className="truncate text-sm font-bold">{poster.title}</h4>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-white/80">
                      {poster.genre}
                    </span>
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-bold',
                        poster.resolution === '4K' || poster.resolution === '8K'
                          ? 'bg-gold/20 text-gold'
                          : 'bg-blue-500/20 text-blue-300',
                      )}
                    >
                      {poster.resolution}
                    </span>
                  </div>
                  <div className="mt-2.5 flex items-center justify-between">
                    <StatusBadge status={poster.status} />
                    <span className="text-[10px] text-white/50">{poster.size}</span>
                  </div>
                </div>
              </button>
            ) : (
              <button
                key={poster.id}
                onClick={() => toggleSelection(poster.id)}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border p-3 text-right transition-all',
                  poster.selected
                    ? cn(accentBorder, execMode ? 'bg-destructive/5' : 'bg-primary/5')
                    : 'border-white/5 bg-secondary/30 hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white transition-colors',
                    poster.selected ? cn(accentBg, accentBorder) : 'border-border bg-transparent',
                  )}
                >
                  {poster.selected && <CheckSquare className="h-3.5 w-3.5" />}
                </span>
                <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={poster.img || '/placeholder.svg'}
                    alt={poster.title}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-foreground">{poster.title}</h4>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">
                      {poster.genre}
                    </span>
                    <span
                      className={cn(
                        'rounded px-2 py-0.5 text-[10px] font-bold',
                        poster.resolution === '4K' || poster.resolution === '8K'
                          ? 'bg-gold/20 text-gold'
                          : 'bg-blue-500/20 text-blue-300',
                      )}
                    >
                      {poster.resolution}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={poster.status} />
                  <span className="text-[10px] text-muted-foreground">{poster.size}</span>
                </div>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  )
}
