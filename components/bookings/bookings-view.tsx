'use client'

import { useState } from 'react'
import { CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { HolidayAlert, CustomsAlert } from '@/components/shared/geo-widgets'
import { AddNewButton, RowActions, type CrudField } from '@/components/shared/crud'

type Booking = { id: string; user: string; service: string; status: string; tone: 'pending' | 'success' | 'muted' | 'danger' }

const initialBookings: Booking[] = [
  { id: '#BK-9982', user: 'شركة الأفق', service: 'استشارة فنية (20 نوفمبر)', status: 'قيد الانتظار', tone: 'pending' },
  { id: '#BK-9981', user: 'استوديو نجمة', service: 'حجز قاعة تصوير (18 نوفمبر)', status: 'مؤكد', tone: 'success' },
  { id: '#BK-9980', user: 'أحمد علي', service: 'جلسة مونتاج (15 نوفمبر)', status: 'مكتمل', tone: 'muted' },
  { id: '#BK-9979', user: 'شركة المدى', service: 'استشارة تسويقية (12 نوفمبر)', status: 'ملغى', tone: 'danger' },
]

const toneClass: Record<string, string> = {
  pending: 'text-gold',
  success: 'text-success',
  muted: 'text-muted-foreground',
  danger: 'text-destructive',
}

const statusOptions = [
  { value: 'قيد الانتظار', label: 'قيد الانتظار' },
  { value: 'مؤكد', label: 'مؤكد' },
  { value: 'مكتمل', label: 'مكتمل' },
  { value: 'ملغى', label: 'ملغى' },
]

const bookingFields = (b?: Booking): CrudField[] => [
  { key: 'user', label: 'المستخدم', value: b?.user, placeholder: 'اسم المستخدم أو الشركة' },
  { key: 'service', label: 'الخدمة / الموعد', value: b?.service, full: true, placeholder: 'مثال: حجز قاعة تصوير (20 نوفمبر)' },
  { key: 'status', label: 'الحالة', value: b?.status ?? 'قيد الانتظار', type: 'select', options: statusOptions },
]

export function BookingsView() {
  const { execMode } = useExecMode()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [bookings, setBookings] = useState(initialBookings)

  const addBooking = (v: Record<string, string>) =>
    setBookings((prev) => [
      { id: `#BK-${Math.floor(1000 + Math.random() * 9000)}`, user: v.user, service: v.service, status: v.status, tone: 'pending' },
      ...prev,
    ])

  const editBooking = (id: string, v: Record<string, string>) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, user: v.user, service: v.service, status: v.status } : b)))

  const removeBooking = (id: string) => setBookings((prev) => prev.filter((b) => b.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <CalendarCheck className={cn('h-6 w-6', accent)} />
            إدارة الحجوزات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">متابعة حجوزات الخدمات والمواعيد وحالتها.</p>
        </div>
        <AddNewButton label="إضافة حجز جديد" entityLabel="الحجز" fields={bookingFields()} onCreated={addBooking} />
      </div>

      {/* Cross-border logistics notices for crew/equipment bookings */}
      <div className="grid gap-3 md:grid-cols-2">
        <HolidayAlert message="تنبيه: 18 نوفمبر عطلة رسمية في الإمارات — قد يتأثر توفر الطواقم هناك." />
        <CustomsAlert message="حجز #BK-9981 يتضمن معدات عابرة للحدود — تأكد من تخليص الكارنيه الجمركي (ATA Carnet) قبل الشحن." />
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">رقم الحجز</th>
                <th className="px-5 py-4 font-semibold">المستخدم</th>
                <th className="px-5 py-4 font-semibold">الخدمة / الموعد</th>
                <th className="px-5 py-4 font-semibold">الحالة</th>
                <th className="px-5 py-4 font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                  <td className="px-5 py-4 font-mono text-foreground">{b.id}</td>
                  <td className="px-5 py-4 font-bold text-foreground">{b.user}</td>
                  <td className="px-5 py-4 text-muted-foreground">{b.service}</td>
                  <td className={cn('px-5 py-4 font-bold', toneClass[b.tone])}>{b.status}</td>
                  <td className="px-5 py-4">
                    <RowActions
                      entityLabel="الحجز"
                      entityName={b.id}
                      fields={bookingFields(b)}
                      onEdited={(v) => editBooking(b.id, v)}
                      onDeleted={() => removeBooking(b.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
