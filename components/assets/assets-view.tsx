'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, Star, MapPin, Loader2, Search, Plus, Edit, Trash, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useApi, apiServices, type BookingItem } from '@/lib/api'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'

// Edit fields for booking items
const bookingItemEditFields = (item: BookingItem): { key: keyof BookingItem; label: string; value: string; full?: boolean; type?: string }[] => [
  { key: 'name', label: 'الاسم', value: item.name, full: true },
  { key: 'quantity', label: 'الكمية', value: item.quantity.toString(), type: 'number' },
  { key: 'price_per_day', label: 'سعر التأجير اليومي', value: item.price_per_day, type: 'number' },
  { key: 'location', label: 'الموقع', value: item.location },
  { key: 'type', label: 'النوع', value: item.type },
  { key: 'description', label: 'الوصف', value: item.description || '', full: true },
]

export function AssetsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const { request } = useApi()
  const { toast } = useToast()
  const { openModal } = useModal()

  const [items, setItems] = useState<BookingItem[] | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Fetch items on mount
  useEffect(() => {
    let active = true
    apiServices.fetchBookingItems().then((data) => {
      if (active) setItems(data)
    })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => {
    if (!items) return []
    return items.filter((item) => {
      const matchesType = filter === 'all' || item.type === filter
      const matchesQuery =
        !query.trim() ||
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
        item.location.toLowerCase().includes(query.toLowerCase())
      return matchesType && matchesQuery
    })
  }, [items, filter, query])

  // Edit an item
  const editItem = async (id: number, values: Record<string, string>) => {
    try {
      const updatedItem = await apiServices.updateBookingItem(id, {
        name: values.name,
        quantity: Number(values.quantity),
        price_per_day: values.price_per_day,
        location: values.location,
        type: values.type,
        description: values.description,
      })
      setItems((prev) =>
        (prev ?? []).map((item) => item.id === id ? { ...item, ...updatedItem } : item)
      )
      toast.success('تم تحديث العنصر بنجاح!')
    } catch (err) {
      console.error('Error updating item:', err)
    }
  }

  // Toggle item active status
  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const updatedItem = await apiServices.updateBookingItem(id, { is_active: isActive })
      setItems((prev) =>
        (prev ?? []).map((item) => item.id === id ? { ...item, ...updatedItem } : item)
      )
      toast.success(`تم ${isActive ? 'تفعيل' : 'إيقاف'} العنصر بنجاح!`)
    } catch (err) {
      console.error('Error toggling item active status:', err)
    }
  }

  // Toggle item approved status
  const toggleApproved = async (id: number, isApproved: boolean) => {
    try {
      const updatedItem = await apiServices.updateBookingItem(id, { is_approved: isApproved })
      setItems((prev) =>
        (prev ?? []).map((item) => item.id === id ? { ...item, ...updatedItem } : item)
      )
      toast.success(`تم ${isApproved ? 'موافقة' : 'إلغاء موافقة'} العنصر بنجاح!`)
    } catch (err) {
      console.error('Error toggling item approved status:', err)
    }
  }

  // Delete an item
  const deleteItem = async (id: number) => {
    try {
      await apiServices.deleteBookingItem(id)
      setItems((prev) => (prev ?? []).filter((item) => item.id !== id))
      toast.success('تم حذف العنصر بنجاح!')
    } catch (err) {
      console.error('Error deleting item:', err)
    }
  }

  // Add an item
  const addItem = async (item: Partial<BookingItem>) => {
    try {
      const newItem = await apiServices.createBookingItem({
        ...item,
        is_active: true,
      })
      setItems((prev) => [newItem, ...(prev ?? [])])
      toast.success('تم إضافة العنصر بنجاح!')
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  const selectedItem = useMemo(() => 
    items?.find(i => i.id === selectedId), 
    [items, selectedId]
  )

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Boxes className={cn('h-6 w-6', accent)} />
            إدارة العناصر للحجز
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            إدارة العناصر المتاحة للحجز مثل الأدوات والاستوديوهات.
          </p>
        </div>
        <AddBookingItemButton onAdded={addItem} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground end-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن اسم، موقع أو وصف..."
          className="w-full rounded-xl border border-border bg-white/5 py-2.5 pe-10 ps-4 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {/* Type filter chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip label="الكل" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="أدوات" active={filter === 'tool'} onClick={() => setFilter('tool')} />
        <FilterChip label="استوديو" active={filter === 'studio'} onClick={() => setFilter('studio')} />
      </div>

      {/* Grid */}
      {items === null ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">لا توجد عناصر مطابقة للبحث.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <BookingItemCard
              key={item.id}
              item={item}
              onOpen={() => setSelectedId(item.id)}
              onEdit={(v) => editItem(item.id, v)}
              onDelete={() => deleteItem(item.id)}
              onToggleActive={toggleActive}
              onToggleApproved={toggleApproved}
            />
          ))}
        </div>
      )}

      {/* Sidebar for details */}
      {selectedItem && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 transition-opacity duration-300 z-40"
            onClick={() => setSelectedId(null)}
          />
          {/* Sidebar */}
          <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col border-s border-border bg-background shadow-2xl transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                <img
                  src={selectedItem.image || '/placeholder.svg'}
                  alt={selectedItem.name}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="إغلاق"
                  className="absolute end-3 top-3 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
                <span className="absolute start-3 top-3 flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-black backdrop-blur-sm bg-white/80 text-foreground">
                  {selectedItem.type === 'tool' ? 'أداة' : 'استوديو'}
                </span>
              </div>
              <div className="px-5 pb-4 pt-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-black leading-snug text-foreground">{selectedItem.name}</h2>
                </div>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {selectedItem.location}
                </p>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-5">
              <p className="text-sm leading-relaxed text-foreground/90">
                {selectedItem.description || 'لا يوجد وصف لهذا العنصر.'}
              </p>

              <div className="space-y-3">
                <h3 className="flex items-center gap-2 text-sm font-black text-foreground">تفاصيل</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">الكمية</span>
                    <span className="font-bold text-foreground">{selectedItem.quantity}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">سعر التأجير اليومي</span>
                    <span className="font-bold text-foreground">{selectedItem.price_per_day} د.ك</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">الحالة</span>
                    <span className={cn("font-bold", selectedItem.is_active ? "text-green-500" : "text-red-500")}>
                      {selectedItem.is_active ? "نشط" : "غير نشط"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">الموافقة</span>
                    <span className={cn("font-bold", selectedItem.is_approved ? "text-green-500" : "text-yellow-500")}>
                      {selectedItem.is_approved ? "معتمد" : "غير معتمد"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.created_by_fullname && (
                <div className="space-y-3">
                  <h3 className="flex items-center gap-2 text-sm font-black text-foreground">المُنشئ</h3>
                  <div className="rounded-xl border border-border bg-white/5 p-3">
                    <p className="text-sm font-bold text-foreground">{selectedItem.created_by_fullname}</p>
                    {selectedItem.created_by_email && (
                      <p className="text-xs text-muted-foreground">{selectedItem.created_by_email}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Filter Chip component
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-white/5 text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
}

// Booking Item Card Component
function BookingItemCard({
  item,
  onOpen,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleApproved,
}: {
  item: BookingItem
  onOpen: () => void
  onEdit: (v: Record<string, string>) => void
  onDelete: () => void
  onToggleActive: (id: number, isActive: boolean) => void
  onToggleApproved: (id: number, isApproved: boolean) => void
}) {
  const { openModal, closeModal } = useModal()

  const openEdit = () => {
    openModal({
      title: 'تعديل العنصر',
      content: <EditBookingItemForm
        item={item}
        onSubmit={async (data) => {
          await onEdit(data)
          closeModal()
        }}
        onCancel={closeModal}
      />,
      size: 'lg',
    })
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      aria-label={`عرض تفاصيل ${item.name}`}
      className="glass group cursor-pointer overflow-hidden rounded-2xl border border-border text-right transition hover:border-primary/50"
    >
      {/* Cover */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
        <img
          src={item.image || '/placeholder.svg'}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute start-2 top-2 flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-black backdrop-blur-sm bg-white/80 text-foreground">
          {item.type === 'tool' ? 'أداة' : 'استوديو'}
        </span>
        {/* Status Badges */}
        <div className="absolute end-2 top-2 flex gap-1">
          {!item.is_approved && (
            <span className="rounded-full bg-yellow-500/80 text-white px-2 py-0.5 text-[10px] font-bold">
              غير معتمد
            </span>
          )}
          {!item.is_active && (
            <span className="rounded-full bg-red-500/80 text-white px-2 py-0.5 text-[10px] font-bold">
              غير نشط
            </span>
          )}
        </div>
        {/* Actions */}
        <div className="absolute bottom-2 end-2 flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleApproved(item.id, !item.is_approved)
            }}
            className={`rounded-full p-2 text-white transition ${item.is_approved ? 'bg-green-600/90 hover:bg-green-600' : 'bg-yellow-600/90 hover:bg-yellow-600'}`}
            title={item.is_approved ? 'إلغاء الموافقة' : 'موافقة'}
          >
            <span className="text-xs font-bold">{item.is_approved ? '✓' : '✗'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleActive(item.id, !item.is_active)
            }}
            className={`rounded-full p-2 text-white transition ${item.is_active ? 'bg-green-600/90 hover:bg-green-600' : 'bg-red-600/90 hover:bg-red-600'}`}
            title={item.is_active ? 'إيقاف' : 'تفعيل'}
          >
            <span className="text-xs font-bold">{item.is_active ? 'تشغيل' : 'إيقاف'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              openEdit()
            }}
            className="rounded-full bg-primary/90 p-2 text-white hover:bg-primary transition"
            title="تعديل"
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirm('هل تريد حذف هذا العنصر؟')) {
                onDelete()
              }
            }}
            className="rounded-full bg-destructive/90 p-2 text-white hover:bg-destructive transition"
            title="حذف"
          >
            <Trash className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-black leading-snug text-foreground">{item.name}</h3>
        </div>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {item.location}
        </p>
        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="text-sm font-black text-foreground">
              {item.price_per_day} د.ك
              <span className="text-xs font-normal text-muted-foreground"> / يوم</span>
            </p>
            <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
          </div>
          {item.created_by_fullname && (
            <span className="rounded-md bg-muted/50 px-2 py-0.5 text-[10px] font-black text-foreground">
              من: {item.created_by_fullname}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Edit Booking Item Form Component
function EditBookingItemForm({
  item,
  onSubmit,
  onCancel,
}: {
  item: BookingItem
  onSubmit: (data: Record<string, string>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState(item.name)
  const [quantity, setQuantity] = useState(item.quantity.toString())
  const [price_per_day, setPricePerDay] = useState(item.price_per_day)
  const [location, setLocation] = useState(item.location)
  const [type, setType] = useState<'tool' | 'studio'>(item.type as 'tool' | 'studio')
  const [description, setDescription] = useState(item.description || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({
        name,
        quantity,
        price_per_day,
        location,
        type,
        description,
      })
    } catch (err) {
      console.error('Error editing item:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الاسم</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" placeholder="اسم العنصر" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">النوع</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'tool' | 'studio')} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary">
            <option value="tool">أداة</option>
            <option value="studio">استوديو</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الكمية</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">سعر التأجير اليومي (د.ك)</label>
          <input type="number" value={price_per_day} onChange={(e) => setPricePerDay(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الموقع</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" placeholder="موقع العنصر" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">الوصف</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary h-32 resize-none" placeholder="وصف العنصر..." />
      </div>
      <div className="flex gap-3 pt-4">
        <button onClick={onCancel} className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10">إلغاء</button>
        <button onClick={handleSubmit} className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-white transition hover:opacity-90">حفظ التعديلات</button>
      </div>
    </div>
  )
}

// Add Booking Item Button Component
function AddBookingItemButton({ onAdded }: { onAdded: (item: Partial<BookingItem>) => void }) {
  const { openModal, closeModal } = useModal()
  const { toast } = useToast()
  const { request } = useApi()

  const openAddModal = () => {
    openModal({
      title: 'إضافة عنصر جديد',
      content: <AddBookingItemForm
        onSubmit={async (data) => {
          await onAdded(data)
          closeModal()
          toast.success('تم إضافة العنصر بنجاح!')
        }}
        onCancel={closeModal}
      />,
      size: 'lg',
    })
  }

  return (
    <button
      onClick={openAddModal}
      className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      إضافة عنصر جديد
    </button>
  )
}

// Add Booking Item Form Component
function AddBookingItemForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Partial<BookingItem>) => Promise<void>
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [price_per_day, setPricePerDay] = useState('0')
  const [location, setLocation] = useState('')
  const [type, setType] = useState<'tool' | 'studio'>('tool')
  const [description, setDescription] = useState('')
  const { request } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({
        name,
        quantity: Number(quantity),
        price_per_day,
        location,
        type,
        description,
      })
    } catch (err) {
      console.error('Error adding item:', err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الاسم</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" placeholder="اسم العنصر" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">النوع</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'tool' | 'studio')} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary">
            <option value="tool">أداة</option>
            <option value="studio">استوديو</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الكمية</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">سعر التأجير اليومي (د.ك)</label>
          <input type="number" value={price_per_day} onChange={(e) => setPricePerDay(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-muted-foreground">الموقع</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary" placeholder="موقع العنصر" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-muted-foreground">الوصف</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none focus:border-primary h-32 resize-none" placeholder="وصف العنصر..." />
      </div>
      <div className="flex gap-3 pt-4">
        <button onClick={onCancel} className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10">إلغاء</button>
        <button onClick={handleSubmit} className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-white transition hover:opacity-90">إضافة العنصر</button>
      </div>
    </div>
  )
}
