'use client'

import { useState, useEffect } from 'react'
import { useModal } from '@/lib/modal'
import api from '@/lib/api'

type ContentCatalogItem = {
  id?: number
  title: string
  genre?: string
  resolution?: '4K' | '8K' | 'HD'
  status?: 'Published' | 'Draft' | 'Tagging'
  image_url?: string
  // Add more fields as per your backend model
}

type ContentCatalogFormProps = {
  item?: ContentCatalogItem | null
  onSuccess?: () => void
}

export function ContentCatalogForm({ item, onSuccess }: ContentCatalogFormProps) {
  const { closeModal } = useModal()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ContentCatalogItem>({
    title: '',
    genre: '',
    resolution: 'HD',
    status: 'Draft',
    image_url: '',
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        genre: item.genre || '',
        resolution: item.resolution || 'HD',
        status: item.status || 'Draft',
        image_url: item.image_url || '',
        id: item.id,
      })
    }
  }, [item])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (item?.id) {
        await api.updateContentCatalogItem(item.id, formData)
      } else {
        await api.createContentCatalogItem(formData)
      }
      onSuccess?.()
      closeModal()
    } catch (error) {
      console.error('Failed to save content catalog item:', error)
      alert('فشل حفظ البيانات')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">العنوان</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">النوع</label>
        <input
          type="text"
          value={formData.genre}
          onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">الدقة</label>
        <select
          value={formData.resolution}
          onChange={(e) => setFormData({ ...formData, resolution: e.target.value as any })}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
        >
          <option value="HD">HD</option>
          <option value="4K">4K</option>
          <option value="8K">8K</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">الحالة</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-foreground focus:outline-none focus:border-primary"
        >
          <option value="Draft">مسودة</option>
          <option value="Published">منشور</option>
          <option value="Tagging">جاري المعالجة</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-muted-foreground mb-1">رابط الصورة</label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full rounded-xl border border-border bg-white/5 px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : item ? 'حفظ التغييرات' : 'إضافة جديد'}
        </button>
      </div>
    </form>
  )
}
