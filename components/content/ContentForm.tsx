'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import api from '@/lib/api'

interface ContentFormProps {
  item?: {
    id: number
    title: string
    type: string
    views?: string | number
    rating?: string | number
    status: string
    tone: string
    img?: string
    rawData?: any
  } | null
  onSuccess: () => void
  onClose: () => void
}

export function ContentForm({ item, onSuccess, onClose }: ContentFormProps) {
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!item)

  useEffect(() => {
    const fetchData = async () => {
      if (!item) {
        setFetching(false)
        return
      }
      setFetching(true)
      try {
        let data: any
        if (item.type === 'فيلم') {
          data = await api.fetchMovie(item.id)
        } else if (item.type === 'مسلسل') {
          data = await api.fetchSeriesItem(item.id)
        } else if (item.type === 'لافتة') {
          data = await api.fetchBanner(item.id)
        } else if (item.type === 'إعلان') {
          data = await api.fetchAdvertise(item.id)
        } else if (item.type === 'تقييم') {
          data = await api.fetchContentRating(item.id)
        }
        setFormData(data || {})
      } catch (error) {
        console.error('Failed to fetch item:', error)
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (item) {
        if (item.type === 'فيلم') {
          await api.updateMovie(item.id, formData)
        } else if (item.type === 'مسلسل') {
          await api.updateSeries(item.id, formData)
        } else if (item.type === 'لافتة') {
          await api.updateBanner(item.id, formData)
        } else if (item.type === 'إعلان') {
          await api.updateAdvertise(item.id, formData)
        } else if (item.type === 'تقييم') {
          await api.updateContentRating(item.id, formData)
        }
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">جارٍ التحميل...</div>
      </div>
    )
  }

  const renderFormFields = () => {
    if (!item) return null

    if (item.type === 'فيلم' || item.type === 'إعلان') {
      return (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">الاسم</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">السعر</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الوصف</label>
            <textarea
              name="about"
              value={formData.about || ''}
              onChange={handleChange}
              className="w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">صورة الغلاف</label>
              <input
                type="text"
                name="cover_image"
                value={formData.cover_image || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="URL للصورة"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">فيديو (Bunny Stream ID)</label>
              <input
                type="text"
                name="video"
                value={formData.video || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">تريلر (Bunny Stream ID)</label>
              <input
                type="text"
                name="trailer"
                value={formData.trailer || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">عدد المشاهدات</label>
              <input
                type="number"
                name="views_count"
                value={formData.views_count || ''}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_ready"
                checked={formData.is_ready || false}
                onChange={handleChange}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-semibold text-foreground">جاهز</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="admin_approved"
                checked={formData.admin_approved || false}
                onChange={handleChange}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm font-semibold text-foreground">موافق من الإدارة</span>
            </label>
          </div>
        </>
      )
    } else if (item.type === 'مسلسل') {
      return (
        <>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">العنوان</label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الوصف</label>
            <textarea
              name="about"
              value={formData.about || ''}
              onChange={handleChange}
              className="w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">صورة الغلاف</label>
            <input
              type="text"
              name="cover_photo"
              value={formData.cover_photo || ''}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="URL للصورة"
            />
          </div>
        </>
      )
    } else if (item.type === 'لافتة') {
      return (
        <>
          <div>
            <label className="mb-2 block text-sm font-semibold text-foreground">الوصف</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full min-h-[100px] rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">الترتيب</label>
              <input
                type="number"
                name="order"
                value={formData.order || 0}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active || false}
              onChange={handleChange}
              className="h-4 w-4 accent-primary"
            />
            <label htmlFor="is_active" className="text-sm font-semibold text-foreground">نشط</label>
          </div>
        </>
      )
    } else if (item.type === 'تقييم') {
      return (
        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">التقييم (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            name="rating"
            value={formData.rating || 5}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          {item ? `تعديل ${item.type}: ${item.title}` : 'إضافة محتوى جديد'}
        </h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFormFields()}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/10 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        </div>
      </form>
    </div>
  )
}
