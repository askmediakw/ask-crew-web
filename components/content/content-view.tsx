'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { LayoutTemplate, Plus, ImagePlus, Star, Trash2, Send, Sparkles, Edit3, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { CmsUploadForm } from '@/components/shared/add-entity-forms'
import { EmptyState } from '@/components/shared/empty-state'
import { SubtitlesButton } from '@/components/shared/geo-widgets'
import { ContentForm } from '@/components/content/ContentForm'
import api from '@/lib/api'

const FILTERS = ['كل المحتوى', 'أفلام', 'مسلسلات', 'لافتات (Banners)', 'إعلانات', 'التقييمات']

type ContentItem = {
  id: number
  title: string
  type: string
  views: string | number
  rating?: string | number
  status: string
  tone: 'success' | 'info' | 'muted'
  img?: string
}

const toneClass: Record<string, string> = {
  success: 'bg-success/20 text-success',
  info: 'bg-accent/20 text-accent',
  muted: 'bg-white/10 text-muted-foreground',
}

export function ContentView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [filter, setFilter] = useState(0)
  const [selected, setSelected] = useState<number[]>([])
  const [content, setContent] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const fetchAllContent = async () => {
    setLoading(true)
    try {
      console.log('Calling API functions...')
      const moviesPromise = api.fetchMovies()
      const seriesPromise = api.fetchSeries()
      const bannersPromise = api.fetchBanners()
      const advertisesPromise = api.fetchAdvertises()
      const ratingsPromise = api.fetchContentRatings()

      console.log('Awaiting promises...')
      const [movies, series, banners, advertises, ratings] = await Promise.all([
        moviesPromise,
        seriesPromise,
        bannersPromise,
        advertisesPromise,
        ratingsPromise,
      ])

      console.log('API Responses:', { movies, series, banners, advertises, ratings })

      const allContent: ContentItem[] = []

      // Process movies
      const moviesList = Array.isArray(movies) ? movies : (movies as any)?.results || []
      console.log('Movies list:', moviesList)
      moviesList.forEach((movie: any) => {
        allContent.push({
          id: movie.id,
          title: movie.name,
          type: 'فيلم',
          views: movie.views_count,
          rating: movie.rating_mean,
          status: movie.admin_approved ? 'منشور' : 'مسودة',
          tone: movie.admin_approved ? 'success' : 'muted',
          img: movie.cover_image,
        })
      })

      // Process series
      const seriesList = Array.isArray(series) ? series : (series as any)?.results || []
      console.log('Series list:', seriesList)
      seriesList.forEach((s: any) => {
        allContent.push({
          id: s.id,
          title: s.title,
          type: 'مسلسل',
          views: '-',
          rating: '-',
          status: 'منشور',
          tone: 'success',
          img: s.cover_photo,
        })
      })

      // Process banners
      const bannersList = Array.isArray(banners) ? banners : (banners as any)?.results || []
      console.log('Banners list:', bannersList)
      bannersList.forEach((banner: any) => {
        allContent.push({
          id: banner.id,
          title: banner.description || 'لافتة',
          type: 'لافتة',
          views: '-',
          rating: '-',
          status: banner.is_active ? 'منشور' : 'مسودة',
          tone: banner.is_active ? 'success' : 'muted',
        })
      })

      // Process advertises
      const advertisesList = Array.isArray(advertises) ? advertises : (advertises as any)?.results || []
      console.log('Advertises list:', advertisesList)
      advertisesList.forEach((ad: any) => {
        allContent.push({
          id: ad.id,
          title: ad.name,
          type: 'إعلان',
          views: ad.views_count,
          rating: ad.rating_mean,
          status: ad.admin_approved ? 'منشور' : 'مسودة',
          tone: ad.admin_approved ? 'success' : 'muted',
          img: ad.cover_image,
        })
      })

      // Process ratings
      const ratingsList = Array.isArray(ratings) ? ratings : (ratings as any)?.results || []
      console.log('Ratings list:', ratingsList)
      ratingsList.forEach((rating: any) => {
        allContent.push({
          id: rating.id,
          title: `تقييم #${rating.id}`,
          type: 'تقييم',
          views: '-',
          rating: rating.rating,
          status: 'منشور',
          tone: 'success',
        })
      })

      console.log('All content:', allContent)
      setContent(allContent)
    } catch (error) {
      console.error('Failed to fetch content:', error)
      console.error('Error details:', (error as Error).stack)
    } finally {
      setLoading(false)
    }
  }

  const refreshContent = async () => {
    await fetchAllContent()
  }

  const editItem = (item: ContentItem) => {
    console.log('Editing item:', item)
    openModal({
      title: `تعديل ${item.title}`,
      content: (
        <ContentForm
          item={item}
          onSuccess={refreshContent}
          onClose={() => {}}
        />
      ),
      size: 'md',
    })
  }

  const deleteItem = async (item: ContentItem) => {
    console.log('Deleting item:', item)
    try {
      if (item.type === 'فيلم') {
        await api.deleteMovie(item.id)
      } else if (item.type === 'مسلسل') {
        await api.deleteSeries(item.id)
      } else if (item.type === 'لافتة') {
        await api.deleteBanner(item.id)
      } else if (item.type === 'إعلان') {
        await api.deleteAdvertise(item.id)
      } else if (item.type === 'تقييم') {
        await api.deleteContentRating(item.id)
      }
      setContent(prev => prev.filter(c => c.id !== item.id))
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  useEffect(() => {
    fetchAllContent()
  }, [])

  const filtered = content.filter((c) => {
    switch (FILTERS[filter]) {
      case 'كل المحتوى':
        return true
      case 'أفلام':
        return c.type === 'فيلم'
      case 'مسلسلات':
        return c.type === 'مسلسل'
      case 'لافتات (Banners)':
        return c.type === 'لافتة'
      case 'إعلانات':
        return c.type === 'إعلان'
      case 'التقييمات':
        return c.type === 'تقييم'
      default:
        return true
    }
  })

  const toggleRow = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  const allVisibleSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id))
  const toggleAll = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((c) => c.id))

  const bulkDelete = () => {
    console.log(`تم حذف ${selected.length} عنصر`)
    setSelected([])
  }
  const bulkPublish = () => {
    console.log(`تم إرسال أمر نشر ${selected.length} عنصر`)
    setSelected([])
  }
  const generateTags = () => {
    console.log('جاري تحليل المحتوى وتوليد الوسوم بالذكاء الاصطناعي...')
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
            onClick={refreshContent}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/15"
          >
            <RotateCcw className="h-4 w-4" />
            تحديث
          </button>
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
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : filtered.length === 0 ? (
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
                  const isSelected = selected.includes(c.id)
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'border-b border-border/60 transition last:border-0 hover:bg-white/5',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(c.id)}
                          aria-label={`تحديد ${c.title}`}
                          className="h-4 w-4 cursor-pointer accent-primary"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {c.img ? (
                            <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-secondary">
                              <Image src={c.img} alt={c.title} fill className="object-cover" sizes="36px" />
                            </div>
                          ) : null}
                          <span className="font-bold text-foreground">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{c.type}</td>
                      <td className="px-5 py-4 text-foreground">{c.views}</td>
                      <td className="px-5 py-4">
                        {!c.rating || c.rating === '-' ? (
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
                        <div className="flex items-center gap-2">
                          {c.type === 'فيلم' || c.type === 'مسلسل' ? (
                            <SubtitlesButton
                              onClick={() => console.log(`تم إرسال طلب ترجمة: ${c.title}`)}
                            />
                          ) : null}
                          <button
                            onClick={() => editItem(c)}
                            className="flex items-center justify-center rounded-lg border border-border bg-white/5 p-2 text-muted-foreground transition hover:bg-white/10 hover:text-foreground shrink-0"
                            aria-label="تعديل"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => deleteItem(c)}
                            className="flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-destructive transition hover:bg-destructive hover:text-white shrink-0"
                            aria-label="حذف"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
