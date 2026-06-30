'use client'

import { useMemo, useState, useEffect } from 'react'
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
  Plus,
  Edit3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import api from '@/lib/api'
import { ContentCatalogForm } from './content-catalog-form'

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
  image_url?: string
  type?: string
  name?: string
  poster?: string
}

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
  const { openModal } = useModal()
  const [posters, setPosters] = useState<Poster[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [dragging, setDragging] = useState(false)
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [pageSize] = useState(10)

  // Generate pagination range with ellipsis
  const getPaginationRange = () => {
    const range: (number | 'ellipsis')[] = []
    const delta = 2

    if (totalPages <= 7) {
      // If there are 7 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        range.push(i)
      }
    } else {
      // Always show first page
      range.push(1)

      // Show pages around current page with ellipsis
      if (currentPage > delta + 2) {
        range.push('ellipsis')
      }
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i)
      }
      if (currentPage < totalPages - delta - 1) {
        range.push('ellipsis')
      }

      // Always show last page
      range.push(totalPages)
    }

    return range
  }

  const accentBg = execMode ? 'bg-destructive' : 'bg-primary'
  const accentText = execMode ? 'text-destructive' : 'text-primary'
  const accentBorder = execMode ? 'border-destructive' : 'border-primary'

  // Fetch posters from API
  const fetchPosters = async (page: number = 1) => {
    setLoading(true)
    try {
      const response = await api.fetchContentCatalog(page, pageSize) as any
      console.log('Content catalog response:', response)
      
      // Handle different response formats
      let results: any[] = []
      let count = 0
      let totalPagesCount = 1
      
      if (Array.isArray(response)) {
        results = response
        count = response.length
      } else if (response?.results) {
        results = response.results
        count = response.count || results.length
        totalPagesCount = response.total_pages || Math.ceil(count / pageSize)
      } else {
        // Fallback
        results = []
      }
      
      // Map API data to Poster type
      const mappedPosters: Poster[] = results.map((item, idx) => ({
        id: item.id || idx + 1,
        title: item.name || item.title || 'Untitled',
        genre: item.type || item.genre || '',
        resolution: (item.resolution as any) || 'HD',
        status: (item.status as any) || 'Draft',
        size: '1.0 MB', // Default or from API
        selected: false,
        img: item.poster || item.image_url || item.img || '/placeholder.svg',
        image_url: item.poster || item.image_url,
      }))
      
      setPosters(mappedPosters)
      setTotalItems(count)
      setTotalPages(totalPagesCount)
    } catch (error) {
      console.error('Failed to fetch content catalog:', error)
      setPosters([])
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchPosters(currentPage)
  }, [currentPage])

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

  const addNewPoster = () => {
    openModal({
      title: 'إضافة بوستر جديد',
      content: <ContentCatalogForm onSuccess={() => fetchPosters(currentPage)} />,
      size: 'md',
    })
  }

  const editPoster = (poster: Poster) => {
    openModal({
      title: 'تعديل البوستر',
      content: <ContentCatalogForm item={poster} onSuccess={() => fetchPosters(currentPage)} />,
      size: 'md',
    })
  }

  const deletePoster = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا البوستر؟')) return
    try {
      await api.deleteContentCatalogItem(id)
      fetchPosters(currentPage)
    } catch (error) {
      console.error('Failed to delete poster:', error)
      alert('فشل حذف البوستر')
    }
  }

  const deleteSelected = async () => {
    if (!confirm('هل أنت متأكد من حذف البوستر المحددة؟')) return
    try {
      const selectedIds = posters.filter(p => p.selected).map(p => p.id)
      await Promise.all(selectedIds.map(id => api.deleteContentCatalogItem(id)))
      fetchPosters(currentPage)
    } catch (error) {
      console.error('Failed to delete selected posters:', error)
      alert('فشل حذف البوستر المحددة')
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

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
          <button
            onClick={addNewPoster}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة بوستر
          </button>
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
              onClick={deleteSelected}
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
          onClick={addNewPoster}
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
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
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
              <div
                key={poster.id}
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
                    'absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors cursor-pointer',
                    poster.selected ? cn(accentBg, accentBorder) : 'border-white/40 bg-black/40',
                  )}
                  onClick={() => toggleSelection(poster.id)}
                >
                  {poster.selected && <CheckSquare className="h-3.5 w-3.5" />}
                </span>

                {/* Action buttons */}
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); editPoster(poster); }}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-primary/80 transition"
                    title="تعديل"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePoster(poster.id); }}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-destructive/80 transition"
                    title="حذف"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

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
              </div>
            ) : (
              <div
                key={poster.id}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border p-3 text-right transition-all',
                  poster.selected
                    ? cn(accentBorder, execMode ? 'bg-destructive/5' : 'bg-primary/5')
                    : 'border-white/5 bg-secondary/30 hover:border-white/20',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white transition-colors cursor-pointer',
                    poster.selected ? cn(accentBg, accentBorder) : 'border-border bg-transparent',
                  )}
                  onClick={() => toggleSelection(poster.id)}
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
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => editPoster(poster)}
                    className="p-1.5 rounded-md bg-white/10 text-muted-foreground hover:bg-primary/20 hover:text-primary transition"
                    title="تعديل"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deletePoster(poster.id)}
                    className="p-1.5 rounded-md bg-white/10 text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition"
                    title="حذف"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          {getPaginationRange().map((page, index) => (
            page === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={cn(
                  'px-4 py-2 rounded-lg border text-sm font-medium transition',
                  currentPage === page
                    ? cn(accentBg, 'text-white')
                    : 'border-border text-muted-foreground hover:bg-white/10'
                )}
              >
                {page}
              </button>
            )
          ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  )
}
