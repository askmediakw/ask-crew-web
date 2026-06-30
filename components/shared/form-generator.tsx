'use client'

import { useState, type FormEvent } from 'react'

// ============================================================================
// GLOBAL FORM GENERATOR (#2)
// ----------------------------------------------------------------------------
// Pass a JSON schema → get a fully-rendered, validated form. No hardcoding.
//
//   const schema: FieldSchema[] = [
//     { name: 'email', label: 'البريد', type: 'email', required: true },
//     { name: 'role', label: 'الدور', type: 'select', options: ['Admin','User'] },
//   ]
//   <FormGenerator schema={schema} onSubmit={(values) => ...} />
// ============================================================================

export type FieldSchema = {
  name: string
  label: string
  type?: 'text' | 'email' | 'number' | 'password' | 'select' | 'textarea' | 'checkbox'
  placeholder?: string
  required?: boolean
  options?: string[]
  min?: number
  max?: number
  pattern?: string
}

type Values = Record<string, string | boolean>

export function FormGenerator({
  schema,
  onSubmit,
  submitLabel = 'حفظ',
}: {
  schema: FieldSchema[]
  onSubmit: (values: Values) => void
  submitLabel?: string
}) {
  const [values, setValues] = useState<Values>(() =>
    Object.fromEntries(schema.map((f) => [f.name, f.type === 'checkbox' ? false : ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = (name: string, value: string | boolean) =>
    setValues((prev) => ({ ...prev, [name]: value }))

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    for (const f of schema) {
      const v = values[f.name]
      if (f.required && (v === '' || v === false || v == null)) {
        next[f.name] = 'هذا الحقل مطلوب'
        continue
      }
      if (typeof v === 'string' && v) {
        if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
          next[f.name] = 'البريد الإلكتروني غير صالح'
        if (f.pattern && !new RegExp(f.pattern).test(v)) next[f.name] = 'القيمة غير مطابقة للصيغة'
        if (f.type === 'number') {
          const n = Number(v)
          if (f.min != null && n < f.min) next[f.name] = `أقل قيمة ${f.min}`
          if (f.max != null && n > f.max) next[f.name] = `أكبر قيمة ${f.max}`
        }
      }
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validate()) onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {schema.map((f) => (
        <div key={f.name} className="flex flex-col gap-1.5">
          {f.type !== 'checkbox' && (
            <label htmlFor={f.name} className="text-sm font-bold text-foreground">
              {f.label}
              {f.required && <span className="text-destructive"> *</span>}
            </label>
          )}

          {f.type === 'select' ? (
            <select
              id={f.name}
              value={String(values[f.name] ?? '')}
              onChange={(e) => setField(f.name, e.target.value)}
              className="input-base py-2.5 text-sm"
            >
              <option value="">— اختر —</option>
              {f.options?.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          ) : f.type === 'textarea' ? (
            <textarea
              id={f.name}
              value={String(values[f.name] ?? '')}
              onChange={(e) => setField(f.name, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
              className="input-base py-2.5 text-sm"
            />
          ) : f.type === 'checkbox' ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-foreground">
              <input
                id={f.name}
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => setField(f.name, e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {f.label}
            </label>
          ) : (
            <input
              id={f.name}
              type={f.type ?? 'text'}
              value={String(values[f.name] ?? '')}
              onChange={(e) => setField(f.name, e.target.value)}
              placeholder={f.placeholder}
              className="input-base py-2.5 text-sm"
            />
          )}

          {errors[f.name] && <span className="text-xs font-bold text-destructive">{errors[f.name]}</span>}
        </div>
      ))}

      <button
        type="submit"
        className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  )
}
