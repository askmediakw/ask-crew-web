'use client'

import { useState } from 'react'
import { Grid3x3, Check, CheckCheck, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'

type PermLevel = 'full' | 'manage' | 'edit' | 'read'

// Full organizational role catalog with a default permission level per role.
// (Emojis from the source list are intentionally dropped — labels carry the meaning.)
const ROLE_CATALOG: { label: string; level: PermLevel }[] = [
  { label: 'المدير التنفيذي (Super Admin)', level: 'full' },
  { label: 'مدير عام (General Manager)', level: 'full' },
  { label: 'المدير المالي (Finance Manager)', level: 'manage' },
  { label: 'مدير الموارد البشرية (HR Manager)', level: 'manage' },
  { label: 'مدير المبيعات والتسويق (Sales & Marketing)', level: 'manage' },
  { label: 'مدير الإنتاج (Production Manager)', level: 'manage' },
  { label: 'مدير المحتوى والميديا (Content Manager)', level: 'manage' },
  { label: 'مخرج فني (Art Director)', level: 'edit' },
  { label: 'محرر فيديو / مونتير (Video Editor)', level: 'edit' },
  { label: 'مصمم جرافيك (Graphic Designer)', level: 'edit' },
  { label: 'أخصائي تواصل اجتماعي (Social Media)', level: 'edit' },
  { label: 'مسؤول علاقات عامة (PR Officer)', level: 'edit' },
  { label: 'مدير التقنية (Tech Lead / CTO)', level: 'full' },
  { label: 'مطور برمجيات (Software Developer)', level: 'edit' },
  { label: 'مسؤول أمن وحماية (Security Officer)', level: 'manage' },
  { label: 'مستشار قانوني (Legal Advisor)', level: 'read' },
  { label: 'ممثل خدمة عملاء (Customer Support)', level: 'read' },
  { label: 'مراقب جودة العمليات (Quality Assurance)', level: 'read' },
  { label: 'مدخل بيانات (Data Entry)', level: 'edit' },
  { label: 'موظف خدمات / صيانة (Basic Staff)', level: 'read' },
]

const ROLES = ROLE_CATALOG.map((r) => r.label)
const MODULES = ['المستخدمين', 'الشركات', 'المحتوى', 'المدفوعات', 'التقارير']
const CRUD = ['إنشاء', 'قراءة', 'تعديل', 'حذف'] as const

type Matrix = Record<string, Record<string, Record<string, boolean>>>

// Maps a permission level to default CRUD rights.
const LEVEL_RIGHTS: Record<PermLevel, Record<(typeof CRUD)[number], boolean>> = {
  full: { إنشاء: true, قراءة: true, تعديل: true, حذف: true },
  manage: { إنشاء: true, قراءة: true, تعديل: true, حذف: false },
  edit: { إنشاء: false, قراءة: true, تعديل: true, حذف: false },
  read: { إنشاء: false, قراءة: true, تعديل: false, حذف: false },
}

function seed(): Matrix {
  const m: Matrix = {}
  ROLE_CATALOG.forEach(({ label, level }) => {
    m[label] = {}
    MODULES.forEach((mod) => {
      m[label][mod] = { ...LEVEL_RIGHTS[level] }
    })
  })
  return m
}

export function RbacMatrix() {
  const { execMode } = useExecMode()
  const [activeRole, setActiveRole] = useState(ROLES[0])
  const [matrix, setMatrix] = useState<Matrix>(seed)
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const activeBg = execMode ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'

  const toggle = (mod: string, right: string) =>
    setMatrix((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [mod]: { ...prev[activeRole][mod], [right]: !prev[activeRole][mod][right] },
      },
    }))

  // Is every CRUD right across every module already enabled for the active role?
  const allGranted = MODULES.every((mod) => CRUD.every((right) => matrix[activeRole][mod][right]))

  // Flip every right for the active role on/off in one click.
  const toggleAll = () =>
    setMatrix((prev) => {
      const next = { ...prev, [activeRole]: { ...prev[activeRole] } }
      MODULES.forEach((mod) => {
        next[activeRole][mod] = {}
        CRUD.forEach((right) => {
          next[activeRole][mod][right] = !allGranted
        })
      })
      return next
    })

  return (
    <div className="glass rounded-2xl border border-border p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className={cn('h-5 w-5', accent)} />
          <h3 className="text-lg font-bold text-foreground">مصفوفة الصلاحيات (RBAC)</h3>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleAll}
            aria-pressed={allGranted}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition',
              allGranted
                ? 'border-border bg-white/5 text-muted-foreground hover:text-foreground'
                : 'border-transparent ' + activeBg,
            )}
          >
            {allGranted ? <Square className="h-3.5 w-3.5" /> : <CheckCheck className="h-3.5 w-3.5" />}
            {allGranted ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
          </button>
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">الدور الوظيفي</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value)}
              aria-label="اختيار الدور الوظيفي"
              className="input-base min-w-[16rem] py-2 text-sm font-bold"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-popover font-medium">
                  {role}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-right text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">الوحدة</th>
              {CRUD.map((c) => (
                <th key={c} className="px-4 py-3 text-center font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODULES.map((mod) => (
              <tr key={mod} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 font-bold text-foreground">{mod}</td>
                {CRUD.map((right) => {
                  const on = matrix[activeRole][mod][right]
                  return (
                    <td key={right} className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggle(mod, right)}
                        aria-label={`${mod} - ${right}`}
                        aria-pressed={on}
                        className={cn(
                          'mx-auto flex h-6 w-6 items-center justify-center rounded-md border transition',
                          on
                            ? execMode
                              ? 'border-destructive bg-destructive text-white'
                              : 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent hover:border-white/40',
                        )}
                      >
                        {on && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
