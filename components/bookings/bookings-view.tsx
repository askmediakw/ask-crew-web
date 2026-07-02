'use client'

import { useEffect, useState, useMemo } from 'react'
import { CalendarCheck, Loader2, Search, Plus } from 'lucide-react'
import { cn, formatGregorianDate } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useApi, apiServices, type Booking, type BookingItem } from '@/lib/api'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'

const statusMap: Record<string, { label: string; tone: string }> = {
  pending: { label: 'قيد الانتظار', tone: 'text-gold' },
  approved: { label: 'مؤكد', tone: 'text-success' },
  done: { label: 'مكتمل', tone: 'text-muted-foreground' },
  rejected: { label: 'مرفوض', tone: 'text-destructive' },
  cancelled: { label: 'ملغى', tone: 'text-destructive' },
}

interface User {
  id: number
  fullname: string
  email: string
}

function BookingFormBody({ onCreated }: { onCreated: (b: Booking) => void }) {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const { request } = useApi()

  const [itemId, setItemId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [items, setItems] = useState<BookingItem[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [itemsData, usersData] = await Promise.all([
          request<BookingItem[]>('/booking/items/'),
          request<User[]>('/profiles/'),
        ])
        setItems(itemsData)
        setUsers(usersData)
      } catch (e) {
        console.error('Failed to load form data', e)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [request])

  const valid = itemId && startDate && endDate && Number(quantity) > 0

  const save = async () => {
    try {
      const data = await apiServices.createBooking({
        item: Number(itemId),
        user: userId ? Number(userId) : undefined,
        start_date: startDate,
        end_date: endDate,
        quantity: Number(quantity),
      })
      onCreated(data)
      toast.success('تمت إضافة الحجز بنجاح')
      closeModal()
    } catch (e) {
      console.error('Failed to create booking', e)
      toast.error('فشل إضافة الحجز')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">العنصر</label>
            <select 
              value={itemId} 
              onChange={(e) => setItemId(e.target.value)} 
              className="input-base"
            >
              <option value="" disabled>اختر عنصر</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">المستخدم</label>
            <select 
              value={userId} 
              onChange={(e) => setUserId(e.target.value)} 
              className="input-base"
            >
              <option value="" disabled>اختر مستخدم (اختياري)</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.fullname} ({user.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">تاريخ البداية</label>
            <input 
              type="date"
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">تاريخ النهاية</label>
            <input 
              type="date"
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              className="input-base"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">الكمية</label>
            <input 
              type="number"
              min="1"
              value={quantity} 
              onChange={(e) => setQuantity(e.target.value)} 
              className="input-base"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <button onClick={closeModal} className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10">
          إلغاء
        </button>
        <button
          onClick={save}
          disabled={!valid}
          className="flex-1 rounded-xl bg-success py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          إضافة الحجز
        </button>
      </div>
    </div>
  )
}

function AddBookingButton({ onCreated }: { onCreated: (b: Booking) => void }) {
  const { openModal } = useModal()
  return (
    <button
      onClick={() => openModal({ title: 'إضافة حجز جديد', content: <BookingFormBody onCreated={onCreated} />, size: 'lg' })}
      className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
    >
      <Plus className="h-4 w-4" />
      إضافة حجز جديد
    </button>
  )
}

export function BookingsView() {
  const { execMode } = useExecMode()
  const { request } = useApi()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const addBooking = (booking: Booking) => {
    setBookings((prev) => prev ? [booking, ...prev] : [booking])
  }

  // Load bookings
  const loadBookings = async () => {
    try {
      // Type the response as unknown first to handle both array and paginated object
      const data = await request<unknown>('/booking/bookings/')
      console.log('API returned for bookings:', data)
      console.log('Type of data:', typeof data)
      console.log('Is array?', Array.isArray(data))
      
      // Handle if it's a pagination object like { results: [...], count: ... }
      let bookingsData: Booking[]
      if (Array.isArray(data)) {
        bookingsData = data as Booking[]
      } else if (
        data && 
        typeof data === 'object' && 
        'results' in data && 
        Array.isArray((data as { results: unknown }).results)
      ) {
        bookingsData = (data as { results: Booking[] }).results
      } else {
        console.error('Unexpected data format from API:', data)
        bookingsData = []
      }
      setBookings(bookingsData)
    } catch (e) {
      console.error('Failed to load bookings', e)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  // Filter bookings
  const filtered = useMemo(() => {
    if (!bookings) return []
    return bookings.filter((b) => {
      const matchesQuery =
        !query ||
        b.item_name.toLowerCase().includes(query.toLowerCase()) ||
        b.user_fullname.toLowerCase().includes(query.toLowerCase()) ||
        b.user_email.toLowerCase().includes(query.toLowerCase())
      const matchesFilter =
        filter === 'all' || b.status === filter
      return matchesQuery && matchesFilter
    })
  }, [bookings, query, filter])

  // Update booking status
  const updateStatus = async (id: number, status: string) => {
    try {
      const updated = await apiServices.updateBooking(id, { status })
      setBookings((prev) => (prev ? prev.map((b) => (b.id === id ? updated : b)) : [updated]))
    } catch (e) {
      console.error('Failed to update booking status', e)
    }
  }

  // Delete booking
  const deleteBooking = async (id: number) => {
    try {
      await apiServices.deleteBooking(id)
      setBookings((prev) => (prev ? prev.filter((b) => b.id !== id) : []))
    } catch (e) {
      console.error('Failed to delete booking', e)
    }
  }

  // Filter chip component
  const FilterChip = ({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold transition',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:bg-white/5'
      )}
    >
      {label}
    </button>
  )

  if (bookings === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <CalendarCheck className={cn('h-6 w-6', accent)} />
            إدارة الحجوزات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">متابعة حجوزات العناصر والمستخدمين وحالتهم.</p>
        </div>
        <AddBookingButton onCreated={addBooking} />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground end-3" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن العنصر أو المستخدم..."
          className="w-full rounded-xl border border-border bg-white/5 py-2.5 pe-10 ps-4 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {/* Status filters */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip label="الكل" value="all" active={filter === 'all'} onClick={() => setFilter('all')} />
        <FilterChip label="قيد الانتظار" value="pending" active={filter === 'pending'} onClick={() => setFilter('pending')} />
        <FilterChip label="مؤكد" value="approved" active={filter === 'approved'} onClick={() => setFilter('approved')} />
        <FilterChip label="مكتمل" value="done" active={filter === 'done'} onClick={() => setFilter('done')} />
        <FilterChip label="ملغى" value="cancelled" active={filter === 'cancelled'} onClick={() => setFilter('cancelled')} />
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">لا توجد حجوزات مطابقة للبحث.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((booking) => {
            const statusInfo = statusMap[booking.status] || { label: booking.status, tone: 'text-muted-foreground' }
            return (
              <div key={booking.id} className="glass overflow-hidden rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-foreground">{booking.item_name}</span>
                      <span className={cn('rounded-full border px-3 py-1 text-xs font-bold', statusInfo.tone)}>
                        {statusInfo.label}
                      </span>
                      {booking.is_paid && (
                        <span className="rounded-full border border-success px-3 py-1 text-xs font-bold text-success">مدفوع</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.user_fullname} • {booking.user_email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatGregorianDate(booking.start_date)} - {formatGregorianDate(booking.end_date)} • الكمية: {booking.quantity}
                    </p>
                    {booking.payment_amount && (
                      <p className="text-sm text-muted-foreground">المبلغ: {booking.payment_amount} د.ك</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {/* Status actions */}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'approved')}
                        className="rounded-lg bg-success/10 px-3 py-2 text-xs font-bold text-success hover:bg-success/20 transition"
                      >
                        موافق
                      </button>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'rejected')}
                        className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
                      >
                        رفض
                      </button>
                    )}
                    {booking.status === 'approved' && (
                      <button
                        onClick={() => updateStatus(booking.id, 'done')}
                        className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
                      >
                        إكمال
                      </button>
                    )}
                    {['pending', 'approved'].includes(booking.status) && (
                      <button
                        onClick={() => updateStatus(booking.id, 'cancelled')}
                        className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
                      >
                        إلغاء
                      </button>
                    )}
                    <button
                      onClick={() => deleteBooking(booking.id)}
                      className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


