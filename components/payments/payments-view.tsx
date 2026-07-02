'use client'

import { useEffect, useState, useMemo } from 'react'
import { Receipt, Loader2 } from 'lucide-react'
import { cn, formatGregorianDate } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useApi, apiServices, type Payment, type ContentPayment, type BookingPayment, type CollectRequest } from '@/lib/api'

const paymentStatusMap: Record<string, { label: string; tone: string }> = {
  pending: { label: 'قيد الانتظار', tone: 'bg-gold/20 text-gold' },
  approved: { label: 'مؤكد', tone: 'bg-success/20 text-success' },
  completed: { label: 'مكتمل', tone: 'bg-success/20 text-success' },
  rejected: { label: 'مرفوض', tone: 'bg-destructive/20 text-destructive' },
  cancelled: { label: 'ملغى', tone: 'bg-muted/20 text-muted-foreground' },
  refunded: { label: 'استرجاع', tone: 'bg-accent/20 text-accent' },
}

type PaymentTab = 'all' | 'payments' | 'content-payments' | 'booking-payments' | 'collect-requests'

export function PaymentsView() {
  const { execMode } = useExecMode()
  const { request } = useApi()
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const [activeTab, setActiveTab] = useState<PaymentTab>('all')
  const [payments, setPayments] = useState<Payment[] | null>(null)
  const [contentPayments, setContentPayments] = useState<ContentPayment[] | null>(null)
  const [bookingPayments, setBookingPayments] = useState<BookingPayment[] | null>(null)
  const [collectRequests, setCollectRequests] = useState<CollectRequest[] | null>(null)
  const [query, setQuery] = useState('')

  const loadData = async () => {
    try {
      const [paymentsData, contentPaymentsData, bookingPaymentsData, collectRequestsData] = await Promise.all([
        apiServices.fetchPayments(),
        apiServices.fetchContentPayments(),
        apiServices.fetchBookingPayments(),
        apiServices.fetchCollectRequests(),
      ])
      
      // Helper function to extract results if paginated
      const extractData = (data: any) => {
        if (Array.isArray(data)) return data
        if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) return data.results
        console.error('Unexpected data format:', data)
        return []
      }
      
      setPayments(extractData(paymentsData))
      setContentPayments(extractData(contentPaymentsData))
      setBookingPayments(extractData(bookingPaymentsData))
      setCollectRequests(extractData(collectRequestsData))
    } catch (e) {
      console.error('Failed to load payments data', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const combinedData = useMemo(() => {
    const data: Array<{
      id: number
      type: 'payment' | 'content-payment' | 'booking-payment' | 'collect-request'
      label: string
      amount: string
      currency: string
      user: string
      date: string
      status?: string
      paid?: boolean
    }> = []

    payments?.forEach(p => data.push({
      id: p.id, type: 'payment', label: `دفع: ${p.description}`,
      amount: p.amount, currency: p.currency, user: `${p.user_fullname} (${p.user_email})`,
      date: p.created_at
    }))
    contentPayments?.forEach(p => data.push({
      id: p.id, type: 'content-payment', label: `دفع محتوى: ${p.description}`,
      amount: p.amount, currency: p.currency, user: `${p.user_fullname} (${p.user_email})`,
      date: p.created_at
    }))
    bookingPayments?.forEach(p => data.push({
      id: p.id, type: 'booking-payment', label: `دفع حجز: ${p.booking_item_name}`,
      amount: p.amount, currency: p.currency, user: `${p.user_fullname} (${p.user_email})`,
      date: p.created_at, paid: p.is_paid, status: p.is_paid ? 'paid' : 'pending'
    }))
    collectRequests?.forEach(p => data.push({
      id: p.id, type: 'collect-request', label: `طلب تحصيل: ${p.source}`,
      amount: p.amount, currency: 'KWD', user: `${p.user_fullname} (${p.user_email})`,
      date: p.created_at, status: p.status
    }))

    return data.filter(item => {
      if (activeTab !== 'all') {
        if (activeTab === 'payments') return item.type === 'payment'
        if (activeTab === 'content-payments') return item.type === 'content-payment'
        if (activeTab === 'booking-payments') return item.type === 'booking-payment'
        if (activeTab === 'collect-requests') return item.type === 'collect-request'
      }
      if (!query) return true
      const lowerQuery = query.toLowerCase()
      return (
        item.label.toLowerCase().includes(lowerQuery) ||
        item.user.toLowerCase().includes(lowerQuery) ||
        item.amount.includes(query)
      )
    })
  }, [payments, contentPayments, bookingPayments, collectRequests, activeTab, query])

  const totalAmount = useMemo(() => {
    return combinedData.reduce((sum, item) => sum + parseFloat(item.amount), 0)
  }, [combinedData])

  if (payments === null && contentPayments === null && bookingPayments === null && collectRequests === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Receipt className={cn('h-6 w-6', accent)} />
            سجل المدفوعات والفواتير
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            جميع المعاملات المالية، النزاعات، وعمليات الاسترجاع.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن معاملة..."
          className="w-full rounded-xl border border-border bg-white/5 py-2.5 px-4 text-sm text-foreground outline-none transition focus:border-primary"
        />
      </div>

      {/* Tabs */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {[
          { label: 'الكل', value: 'all' },
          { label: 'المدفوعات العامة', value: 'payments' },
          { label: 'دفع المحتوى', value: 'content-payments' },
          { label: 'دفع الحجوزات', value: 'booking-payments' },
          { label: 'طلبات التحصيل', value: 'collect-requests' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as PaymentTab)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition whitespace-nowrap',
              activeTab === tab.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'hover:bg-white/5'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="glass flex items-center justify-between rounded-2xl border border-border p-4">
        <span className="text-sm text-muted-foreground">إجمالي المعاملات (KWD)</span>
        <span className="text-xl font-black text-foreground">{totalAmount.toFixed(3)}</span>
      </div>

      {/* Data table */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-4 font-semibold">النوع</th>
                <th className="px-5 py-4 font-semibold">المستخدم</th>
                <th className="px-5 py-4 font-semibold">الوصف</th>
                <th className="px-5 py-4 font-semibold">المبلغ</th>
                <th className="px-5 py-4 font-semibold">الحالة</th>
                <th className="px-5 py-4 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    لا توجد بيانات للعرض
                  </td>
                </tr>
              ) : (
                combinedData.map((item) => (
                  <tr key={`${item.type}-${item.id}`} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                    <td className="px-5 py-4 text-muted-foreground">
                      {item.type === 'payment' && 'دفع'}
                      {item.type === 'content-payment' && 'دفع محتوى'}
                      {item.type === 'booking-payment' && 'دفع حجز'}
                      {item.type === 'collect-request' && 'طلب تحصيل'}
                    </td>
                    <td className="px-5 py-4 text-foreground">{item.user}</td>
                    <td className="px-5 py-4 text-muted-foreground">{item.label}</td>
                    <td className="px-5 py-4 font-bold text-foreground">{item.amount} {item.currency}</td>
                    <td className="px-5 py-4">
                      {item.type === 'booking-payment' && (
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', item.paid ? 'bg-success/20 text-success' : 'bg-gold/20 text-gold')}>
                          {item.paid ? 'مدفوع' : 'قيد الدفع'}
                        </span>
                      )}
                      {item.type === 'collect-request' && item.status && (
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', paymentStatusMap[item.status]?.tone || 'bg-muted/20 text-muted-foreground')}>
                          {paymentStatusMap[item.status]?.label || item.status}
                        </span>
                      )}
                      {!['booking-payment', 'collect-request'].includes(item.type) && (
                        <span className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-bold text-success">
                          مكتمل
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {formatGregorianDate(item.date)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
