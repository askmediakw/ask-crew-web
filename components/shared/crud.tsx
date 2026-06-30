'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical, Pencil, Trash2, Archive, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'

// ============================================================================
// UNIVERSAL CRUD PRIMITIVES
// ----------------------------------------------------------------------------
// Reusable building blocks that give every data table/list the same
// "[+ إضافة]" button and per-row "⋮" actions menu (تعديل / أرشفة / حذف).
//
//   <AddNewButton label="إضافة عقد جديد" fields={...} entityLabel="العقد" />
//   <RowActions entityLabel="الحجز" entityName={b.id} fields={...}
//               onDeleted={() => remove(b.id)} archivable />
//
// The edit/create form is generated from a simple field schema so no bespoke
// form component is needed per resource. Saving fires a success toast (the
// real persistence is left to the backend — see lib/api-contract.ts CRUD).
// ============================================================================

export type CrudFieldType = 'text' | 'number' | 'date' | 'textarea' | 'select'

export type CrudField = {
  key: string
  label: string
  value?: string
  type?: CrudFieldType
  placeholder?: string
  options?: { value: string; label: string }[]
  /** Render hint: full row width inside the grid. */
  full?: boolean
}

// --------------------------------------------------------------- generic form
function EntityForm({
  fields,
  saveLabel,
  saveClass = 'bg-primary text-primary-foreground',
  onSaved,
}: {
  fields: CrudField[]
  saveLabel: string
  saveClass?: string
  onSaved: (values: Record<string, string>) => void
}) {
  const { closeModal } = useModal()
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(fields.map((f) => [f.key, f.value ?? ''])),
  )

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }))
  const requiredMissing = fields.some((f) => f.type !== 'select' && !String(values[f.key] ?? '').trim())

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={cn(f.full || f.type === 'textarea' ? 'sm:col-span-2' : '')}>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">{f.label}</label>
            {f.type === 'select' ? (
              <select value={values[f.key]} onChange={(e) => set(f.key, e.target.value)} className="input-base">
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value} className="bg-popover">
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-base h-24 resize-none"
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="input-base"
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-3">
        <button
          onClick={closeModal}
          className="flex-1 rounded-xl border border-border bg-white/5 py-3 text-sm font-bold text-foreground transition hover:bg-white/10"
        >
          إلغاء
        </button>
        <button
          onClick={() => onSaved(values)}
          disabled={requiredMissing}
          className={cn(
            'flex-1 rounded-xl py-3 text-sm font-bold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40',
            saveClass,
          )}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

// --------------------------------------------------------------- add button
export function AddNewButton({
  label,
  entityLabel,
  fields,
  onCreated,
  className,
}: {
  /** Button text, e.g. "إضافة عقد جديد". */
  label: string
  /** Singular noun used in the success toast, e.g. "العقد". */
  entityLabel: string
  fields: CrudField[]
  onCreated?: (values: Record<string, string>) => void
  className?: string
}) {
  const { openModal, closeModal } = useModal()
  const { toast } = useToast()

  const open = () =>
    openModal({
      title: label,
      content: (
        <EntityForm
          fields={fields}
          saveLabel="حفظ"
          saveClass="bg-success text-white"
          onSaved={(values) => {
            // TODO(backend): POST /api/<resource> with `values`.
            onCreated?.(values)
            toast.success(`تمت إضافة ${entityLabel} بنجاح`)
            closeModal()
          }}
        />
      ),
    })

  return (
    <button
      onClick={open}
      className={cn(
        'flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90',
        className,
      )}
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  )
}

// --------------------------------------------------------------- row actions
export function RowActions({
  entityLabel,
  entityName,
  fields,
  onEdited,
  onDeleted,
  onArchived,
  archivable = true,
}: {
  /** Singular noun, e.g. "الحجز". */
  entityLabel: string
  /** Specific row identifier shown in confirm/toast, e.g. "BK-9982". */
  entityName: string
  /** When provided, the Edit action opens a prefilled form. */
  fields?: CrudField[]
  onEdited?: (values: Record<string, string>) => void
  onDeleted?: () => void
  onArchived?: () => void
  archivable?: boolean
}) {
  const { openModal, closeModal, confirm } = useModal()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const handleEdit = () => {
    setOpen(false)
    openModal({
      title: `تعديل ${entityLabel} (${entityName})`,
      content: (
        <EntityForm
          fields={fields ?? []}
          saveLabel="حفظ التعديلات"
          onSaved={(values) => {
            // TODO(backend): PUT /api/<resource>/:id with `values`.
            onEdited?.(values)
            toast.success(`تم تحديث ${entityLabel} بنجاح`)
            closeModal()
          }}
        />
      ),
    })
  }

  const handleArchive = async () => {
    setOpen(false)
    const ok = await confirm({
      title: `أرشفة ${entityLabel}`,
      message: `سيتم نقل "${entityName}" إلى الأرشيف ويمكن استرجاعه لاحقاً. هل تريد المتابعة؟`,
      confirmLabel: 'أرشفة',
    })
    if (!ok) return
    // TODO(backend): PATCH /api/<resource>/:id { archived: true }
    onArchived?.()
    toast.success(`تمت أرشفة ${entityLabel} (${entityName})`)
  }

  const handleDelete = async () => {
    setOpen(false)
    const ok = await confirm({
      title: `حذف ${entityLabel}`,
      message: `سيتم حذف "${entityName}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`,
      confirmLabel: 'حذف نهائي',
      danger: true,
    })
    if (!ok) return
    // TODO(backend): DELETE /api/<resource>/:id
    onDeleted?.()
    toast.success(`تم حذف ${entityLabel} (${entityName})`)
  }

  return (
    <div className="relative inline-block text-right" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`إجراءات ${entityName}`}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="glass absolute left-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-border py-1 shadow-2xl"
        >
          {fields && fields.length > 0 && (
            <button
              role="menuitem"
              onClick={handleEdit}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-sm text-foreground transition hover:bg-white/10"
            >
              <Pencil className="h-4 w-4 text-primary" />
              تعديل
            </button>
          )}
          {archivable && (
            <button
              role="menuitem"
              onClick={handleArchive}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-sm text-foreground transition hover:bg-white/10"
            >
              <Archive className="h-4 w-4 text-warning" />
              أرشفة
            </button>
          )}
          <button
            role="menuitem"
            onClick={handleDelete}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-sm text-destructive transition hover:bg-destructive/15"
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </button>
        </div>
      )}
    </div>
  )
}
