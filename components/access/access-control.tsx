'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { apiServices, useApi } from '@/lib/api'
import { RbacMatrix } from '@/components/access/rbac-matrix'
import { Radar, LogOut, X, AlertTriangle, Plus, Trash2, GripVertical } from 'lucide-react'

type StaffStatus = 'online' | 'offline' | 'kicked'
type Staff = {
  id: number
  name: string
  role: string
  status: StaffStatus
  lastActive: string
  avatar: string
}
type LogType = 'danger' | 'warning' | 'info' | 'default'
type AuditLog = {
  id: number
  user: string
  action: string
  time: string
  type: LogType
}

const ROLES = [
  'المدير التنفيذي (Super Admin) 👑',
  'مدير عام (General Manager) 👔',
  'المدير المالي (Finance Manager) 💰',
  'مدير مبيعات وتسويق (Sales & Marketing) 📈',
  'مدير محتوى وميديا (Content Manager) 🎬',
  'موظف خدمة عملاء (Customer Support) 🎧',
  'مدخل بيانات (Data Entry) ⌨️',
  'مراقب عمليات (Operations Viewer) 👁️',
  'موظف خدمات / صيانة (Basic Staff) 🧹',
]

const initialStaff: Staff[] = [
  { id: 1, name: 'أحمد خالد', role: 'المدير التنفيذي (Super Admin) 👑', status: 'online', lastActive: 'الآن', avatar: 'أ' },
  { id: 2, name: 'سارة محمد', role: 'مدير محتوى وميديا (Content Manager) 🎬', status: 'online', lastActive: 'قبل 5 دقائق', avatar: 'س' },
  { id: 3, name: 'خالد الفهد', role: 'موظف خدمة عملاء (Customer Support) 🎧', status: 'offline', lastActive: 'قبل 3 ساعات', avatar: 'خ' },
  { id: 4, name: 'راجو كومار', role: 'موظف خدمات / صيانة (Basic Staff) 🧹', status: 'online', lastActive: 'الآن', avatar: 'ر' },
]

const initialLogs: AuditLog[] = [
  { id: 101, user: 'أحمد خالد', action: 'تغيير سعر باقة (VIP) إلى 1152 د.ك', time: '10:45 ص', type: 'warning' },
  { id: 102, user: 'سارة محمد', action: 'رفع 50 بوستر جديد لمكتبة الميديا', time: '09:20 ص', type: 'info' },
  { id: 103, user: 'عامر الفضلي', action: 'تفعيل وضع الإدارة العليا (God Mode)', time: '08:00 ص', type: 'danger' },
  { id: 104, user: 'خالد الفهد', action: 'تسجيل خروج من النظام', time: 'أمس 11:30 م', type: 'default' },
]

const statusLabel: Record<StaffStatus, string> = {
  online: 'متصل',
  offline: 'غير متصل',
  kicked: 'تم طرده',
}

export function AccessControl() {
  const { execMode } = useExecMode()
  const { request } = useApi()
  const [staffMembers, setStaffMembers] = useState<Staff[]>(initialStaff)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialLogs)
  const [confirmTarget, setConfirmTarget] = useState<Staff | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null)
  const [dragId, setDragId] = useState<number | null>(null)

  const accentText = execMode ? 'text-destructive' : 'text-primary'

  function pushLog(action: string, type: LogType) {
    setAuditLogs((prev) => [
      { id: Date.now(), user: 'عامر الفضلي', action, time: 'الآن', type },
      ...prev,
    ])
  }

  async function handleRoleChange(id: number, newRole: string) {
    const staffName = staffMembers.find((s) => s.id === id)?.name ?? ''
    const prevRole = staffMembers.find((s) => s.id === id)?.role
    // Optimistic update
    setStaffMembers((prev) => prev.map((s) => (s.id === id ? { ...s, role: newRole } : s)))
    try {
      // ONE LINE FOR THE BACKEND DEV — PUT /staff/:id/role
      await request(`/staff/${id}/role`, 'PUT', { role: newRole }, {
        errorMessage: 'فشل في تحديث الصلاحية، يرجى المحاولة مرة أخرى.',
      })
      pushLog(`تغيير صلاحية ${staffName} إلى ${newRole}`, 'warning')
    } catch {
      // Roll back on failure
      if (prevRole) {
        setStaffMembers((prev) => prev.map((s) => (s.id === id ? { ...s, role: prevRole } : s)))
      }
    }
  }

  async function confirmForceLogout() {
    if (!confirmTarget) return
    const { id, name } = confirmTarget
    setConfirmTarget(null)
    try {
      // POST /auth/force-logout
      await request('/auth/force-logout', 'POST', { userId: id }, {
        errorMessage: 'تعذر إغلاق الجلسة، يرجى المحاولة مرة أخرى.',
      })
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'kicked', lastActive: 'تم طرده الآن' } : s)),
      )
      pushLog(`تم طرد ${name} وإغلاق جلسته`, 'danger')
    } catch {
      /* error toast already shown globally */
    }
  }

  async function addStaff() {
    const num = staffMembers.length + 1
    const name = `موظف جديد ${num}`
    const newStaff: Staff = {
      id: Date.now(),
      name,
      role: ROLES[ROLES.length - 1],
      status: 'offline',
      lastActive: 'لم يسجل دخول',
      avatar: 'ج',
    }
    try {
      // POST /staff (via the central apiServices map)
      await apiServices.createStaff(newStaff)
      setStaffMembers((prev) => [...prev, newStaff])
      pushLog(`إضافة موظف جديد (${name}) للنظام`, 'info')
    } catch {
      /* swallow — see note below */
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const { id, name } = deleteTarget
    setDeleteTarget(null)
    try {
      // DELETE /staff/:id (via the central apiServices map)
      await request(`/staff/${id}`, 'DELETE', null, {
        errorMessage: 'تعذر حذف الموظف، يرجى المحاولة مرة أخرى.',
      })
      setStaffMembers((prev) => prev.filter((s) => s.id !== id))
      pushLog(`حذف الموظف ${name} نهائياً من النظام`, 'danger')
    } catch {
      /* error toast already shown globally */
    }
  }

  function handleDrop(targetId: number) {
    if (dragId === null || dragId === targetId) return setDragId(null)
    setStaffMembers((prev) => {
      const list = [...prev]
      const from = list.findIndex((s) => s.id === dragId)
      const to = list.findIndex((s) => s.id === targetId)
      const [moved] = list.splice(from, 1)
      list.splice(to, 0, moved)
      return list
    })
    setDragId(null)
  }

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      {/* Staff management */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">إدارة الموظفين والصلاحيات</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              تحكم كامل بمن يمكنه الدخول والتعديل على المنصة.
            </p>
          </div>
          <button
            onClick={addStaff}
            className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            إضافة موظف
          </button>
        </div>

        <div className="glass overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-muted-foreground">
              <tr>
                <th className="p-4 font-bold">الموظف</th>
                <th className="p-4 font-bold">الحالة</th>
                <th className="p-4 font-bold">الصلاحية (Role)</th>
                <th className="p-4 text-center font-bold">إجراءات حاسمة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffMembers.map((staff) => (
                <tr
                  key={staff.id}
                  draggable
                  onDragStart={() => setDragId(staff.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(staff.id)}
                  className={cn(
                    'group transition-colors hover:bg-white/5',
                    dragId === staff.id && 'opacity-40',
                  )}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground/50 transition group-hover:text-foreground active:cursor-grabbing" />
                      <span
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white',
                          execMode ? 'bg-destructive/80' : 'bg-primary/80',
                        )}
                      >
                        {staff.avatar}
                      </span>
                      <div>
                        <p className="font-bold text-foreground">{staff.name}</p>
                        <p className="text-[10px] text-muted-foreground">آخر نشاط: {staff.lastActive}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                        staff.status === 'online'
                          ? 'bg-success/10 text-success'
                          : staff.status === 'kicked'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted/40 text-muted-foreground',
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          staff.status === 'online'
                            ? 'bg-success'
                            : staff.status === 'kicked'
                              ? 'bg-destructive'
                              : 'bg-muted-foreground',
                        )}
                      />
                      {statusLabel[staff.status]}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={staff.role}
                      onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                      disabled={staff.status === 'kicked'}
                      className="input-base max-w-[240px] cursor-pointer py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role} className="bg-card text-foreground">
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                      <button
                        onClick={() => setConfirmTarget(staff)}
                        disabled={staff.status === 'kicked'}
                        className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-1.5 text-xs font-bold text-warning transition-all hover:bg-warning/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        طرد مؤقت
                      </button>
                      <button
                        onClick={() => setDeleteTarget(staff)}
                        className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive transition-all hover:bg-destructive hover:text-white"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <RbacMatrix />
      </div>

      {/* Audit log radar */}
      <div className="flex w-full flex-col xl:w-[380px]">
        <div
          className={cn(
            'glass flex flex-1 flex-col rounded-3xl border p-6',
            execMode ? 'border-destructive/30 glow-alert' : 'border-primary/30 glow-brand',
          )}
        >
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
              <Radar className={cn('h-5 w-5', accentText)} />
              رادار المراقبة
            </h3>
            <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              يسجل الآن...
            </span>
          </div>

          <div className="scrollbar-thin -mr-2 flex-1 space-y-4 overflow-y-auto pr-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="relative border-r-2 border-border pr-4">
                <span
                  className={cn(
                    'absolute -right-[9px] top-1 h-4 w-4 rounded-full border-4 border-card',
                    log.type === 'danger'
                      ? 'bg-destructive'
                      : log.type === 'warning'
                        ? 'bg-gold'
                        : log.type === 'info'
                          ? 'bg-primary'
                          : 'bg-muted-foreground',
                  )}
                />
                <div className="rounded-xl border border-border bg-white/5 p-3 transition hover:bg-white/10">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground">{log.user}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{log.time}</span>
                  </div>
                  <p className={cn('text-sm', log.type === 'danger' ? 'text-destructive' : 'text-foreground')}>
                    {log.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Force-logout confirm dialog */}
      {confirmTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="glass w-full max-w-sm rounded-2xl border border-destructive/40 p-6 glow-alert"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                تأكيد الطرد
              </h3>
              <button
                onClick={() => setConfirmTarget(null)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              هل أنت متأكد من طرد وتسجيل خروج{' '}
              <span className="font-bold text-foreground">{confirmTarget.name}</span> من النظام فوراً؟ سيتم إغلاق
              جلسته الحالية.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmForceLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <LogOut className="h-4 w-4" />
                طرد فوراً
              </button>
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="glass w-full max-w-sm rounded-2xl border border-destructive/40 p-6 glow-alert"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-black text-foreground">
                <Trash2 className="h-5 w-5 text-destructive" />
                حذف الموظف نهائياً
              </h3>
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              سيتم حذف{' '}
              <span className="font-bold text-foreground">{deleteTarget.name}</span> وكل صلاحياته نهائياً. لا
              يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
              >
                <Trash2 className="h-4 w-4" />
                حذف نهائي
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
