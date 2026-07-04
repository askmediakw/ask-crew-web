'use client'

import { useState, useEffect, type ReactNode } from 'react'
import { BellRing, Plus, Edit, Trash2, CheckCircle2, AlertCircle, Users, User } from 'lucide-react'
import { cn, formatGregorianDate } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import apiServices, { AdminNotificationType } from '@/lib/api'

type ApiUser = {
  id: number
  fullname: string
  email: string
  is_active: boolean
  is_verified: boolean
  date_joined: string
  type: 'viewer' | 'enterprise' | 'student'
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-2 block text-sm font-medium text-muted-foreground">{children}</label>
}

function FormShell({
  children,
  onSave,
  saveLabel = 'حفظ',
  saveClass = 'bg-primary text-primary-foreground',
  disabled,
}: {
  children: ReactNode
  onSave: () => void
  saveLabel?: string
  saveClass?: string
  disabled?: boolean
}) {
  const { closeModal } = useModal()
  return (
    <div className="w-full">
      <div className="space-y-4">{children}</div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={closeModal}
          className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10"
        >
          إلغاء
        </button>
        <button
          onClick={onSave}
          disabled={disabled}
          className={`flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${saveClass}`}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

function NotificationForm({ notification, onSuccess, isEdit = false }: { notification?: AdminNotificationType; onSuccess: () => void; isEdit?: boolean }) {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [users, setUsers] = useState<ApiUser[]>([])
  const [selectedUser, setSelectedUser] = useState(notification?.user.toString() || '')
  const [notificationType, setNotificationType] = useState(notification?.notification_type || 'custom')
  const [title, setTitle] = useState(notification?.title || '')
  const [message, setMessage] = useState(notification?.message || '')
  const [isRead, setIsRead] = useState(notification?.is_read ?? false)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiServices.fetchUsers() as ApiUser[]
        setUsers(data)
        if (!isEdit && data.length > 0) setSelectedUser(String(data[0].id))
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }
    fetchUsers()
  }, [isEdit])

  const save = async () => {
    if (!selectedUser) return
    try {
      if (isEdit && notification) {
        await apiServices.updateNotification(notification.id, {
          user: Number(selectedUser),
          notification_type: notificationType,
          title,
          message,
          is_read: isRead,
          metadata: {}
        })
        toast.success(`تم تحديث الإشعار: ${title}`)
      } else {
        await apiServices.createNotification({
          user: Number(selectedUser),
          notification_type: notificationType,
          title,
          message,
          is_read: isRead,
          metadata: {}
        })
        toast.success(`تم إنشاء الإشعار: ${title}`)
      }
      onSuccess()
      closeModal()
    } catch (error) {
      toast.error(isEdit ? 'حدث خطأ أثناء تحديث الإشعار' : 'حدث خطأ أثناء إنشاء الإشعار')
      console.error(error)
    }
  }

  const valid = title.trim() && message.trim() && selectedUser

  return (
    <FormShell onSave={save} saveLabel={isEdit ? "تحديث الإشعار" : "إنشاء الإشعار"} saveClass="bg-success text-white" disabled={!valid}>
      <div>
        <FieldLabel>المستخدم</FieldLabel>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="input-base">
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.fullname} ({user.email})</option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>نوع الإشعار</FieldLabel>
        <select value={notificationType} onChange={(e) => setNotificationType(e.target.value as any)} className="input-base">
          <option value="message">رسالة</option>
          <option value="payment">دفع</option>
          <option value="profile_verification">تأكيد ملف شخصي</option>
          <option value="system">نظام</option>
          <option value="custom">مخصص</option>
        </select>
      </div>
      <div>
        <FieldLabel>عنوان الإشعار</FieldLabel>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-base" placeholder="عنوان الإشعار" />
      </div>
      <div>
        <FieldLabel>نص الرسالة</FieldLabel>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="input-base resize-none" placeholder="نص الرسالة..." />
      </div>
      <div>
        <FieldLabel>مقروء</FieldLabel>
        <select value={String(isRead)} onChange={(e) => setIsRead(e.target.value === 'true')} className="input-base">
          <option value="false">لا</option>
          <option value="true">نعم</option>
        </select>
      </div>
    </FormShell>
  )
}

export function NotificationsView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const { toast } = useToast()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const [notifications, setNotifications] = useState<AdminNotificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await apiServices.fetchNotifications()
      setNotifications(data)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [reloadKey])

  const reload = () => {
    setReloadKey(prev => prev + 1)
  }

  const deleteNotification = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      try {
        await apiServices.deleteNotification(id)
        toast.success('تم حذف الإشعار بنجاح')
        reload()
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الإشعار')
        console.error(error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <BellRing className={cn('h-6 w-6', accent)} />
            إدارة الإشعارات
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">إرسال وإدارة الإشعارات للمستخدمين.</p>
        </div>
        <button
          onClick={() => openModal({ title: 'إنشاء إشعار جديد', content: <NotificationForm onSuccess={reload} />, size: 'lg' })}
          className={cn(
            'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90',
            execMode ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20',
          )}
        >
          <Plus className="h-4 w-4" />
          إنشاء إشعار
        </button>
      </div>

      {/* Notifications List */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <BellRing className={cn('h-5 w-5', accent)} />
            قائمة الإشعارات
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-8">لا توجد إشعارات بعد</p>
          ) : (
            <table className="w-full min-w-[640px] text-right text-sm">
              <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-4 font-semibold">المستخدم</th>
                  <th className="px-5 py-4 font-semibold">النوع</th>
                  <th className="px-5 py-4 font-semibold">العنوان</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">التاريخ</th>
                  <th className="px-5 py-4 font-semibold text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{notification.user_fullname}</p>
                          <p className="text-[10px] text-muted-foreground">{notification.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                        {notification.notification_type === 'message' && 'رسالة'}
                        {notification.notification_type === 'payment' && 'دفع'}
                        {notification.notification_type === 'profile_verification' && 'تأكيد'}
                        {notification.notification_type === 'system' && 'نظام'}
                        {notification.notification_type === 'custom' && 'مخصص'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-foreground">{notification.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{notification.message}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                        notification.is_read ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      )}>
                        {notification.is_read ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            مقروء
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3" />
                            غير مقروء
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {formatGregorianDate(notification.created_at)}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openModal({ title: 'تعديل الإشعار', content: <NotificationForm notification={notification} onSuccess={reload} isEdit={true} />, size: 'lg' })}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
