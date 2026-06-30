'use client'

import { useState } from 'react'
import { GraduationCap, Plus, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { WorkshopForm, JobForm } from '@/components/shared/add-entity-forms'
import { RadiusLocator } from '@/components/shared/geo-widgets'
import { RowActions, type CrudField } from '@/components/shared/crud'

type Workshop = { title: string; trainer: string; date: string; km: number; venue: string; seats: string; status: string; tone: 'success' | 'muted' }
type Job = { title: string; type: string; applicants: string; status: string; tone: 'success' | 'muted' }

const initialWorkshops: Workshop[] = [
  { title: 'أساسيات كتابة السيناريو', trainer: 'أحمد خالد', date: '15 نوفمبر • 8:00 م', km: 4, venue: 'مدينة الكويت', seats: '120 / 150', status: 'مفتوح للتسجيل', tone: 'success' },
  { title: 'الإخراج السينمائي المتقدم', trainer: 'سارة محمد', date: '22 نوفمبر • 7:00 م', km: 12, venue: 'حولي', seats: '85 / 100', status: 'مفتوح للتسجيل', tone: 'success' },
  { title: 'مونتاج الفيديو الاحترافي', trainer: 'خالد الفهد', date: '1 ديسمبر • 6:00 م', km: 27, venue: 'الأحمدي', seats: '40 / 40', status: 'مكتمل', tone: 'muted' },
]

const initialJobs: Job[] = [
  { title: 'مطلوب محرر فيديو (Freelance)', type: 'وظيفة', applicants: '45 سيرة ذاتية', status: 'نشط', tone: 'success' },
  { title: 'مصمم جرافيك للحملات الإعلانية', type: 'عقد مؤقت', applicants: '28 سيرة ذاتية', status: 'نشط', tone: 'success' },
  { title: 'كاتب محتوى إبداعي', type: 'دوام كامل', applicants: '67 سيرة ذاتية', status: 'مغلق', tone: 'muted' },
]

const toneClass: Record<string, string> = {
  success: 'bg-success/20 text-success',
  muted: 'bg-white/10 text-muted-foreground',
}

const workshopFields = (w?: Workshop): CrudField[] => [
  { key: 'title', label: 'عنوان الورشة', value: w?.title, full: true, placeholder: 'مثال: أساسيات الإخراج' },
  { key: 'trainer', label: 'المدرب', value: w?.trainer, placeholder: 'اسم المحاضر' },
  { key: 'date', label: 'التاريخ والوقت', value: w?.date, placeholder: 'مثال: 15 نوفمبر • 8:00 م' },
  { key: 'venue', label: 'الموقع', value: w?.venue, placeholder: 'مدينة الكويت' },
  { key: 'seats', label: 'المقاعد', value: w?.seats, placeholder: '120 / 150' },
]

const jobFields = (j?: Job): CrudField[] => [
  { key: 'title', label: 'عنوان الوظيفة', value: j?.title, full: true, placeholder: 'مثال: مطلوب محرر فيديو' },
  { key: 'type', label: 'نوع التعاقد', value: j?.type, placeholder: 'وظيفة / عقد مؤقت' },
  { key: 'applicants', label: 'المتقدمين', value: j?.applicants, placeholder: '45 سيرة ذاتية' },
]

export function WorkshopsView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [tab, setTab] = useState<'workshops' | 'jobs'>('workshops')
  const [workshops, setWorkshops] = useState(initialWorkshops)
  const [jobs, setJobs] = useState(initialJobs)
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const activePill = execMode ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <GraduationCap className={cn('h-6 w-6', accent)} />
            ورش العمل والوظائف
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">جدولة الورش التدريبية وإدارة فرص العمل المتاحة.</p>
        </div>
        <button
          onClick={() =>
            tab === 'workshops'
              ? openModal({ title: 'جدولة ورشة عمل جديدة', content: <WorkshopForm /> })
              : openModal({ title: 'نشر وظيفة جديدة', content: <JobForm /> })
          }
          className="flex items-center gap-2 rounded-xl bg-success px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-success/20 transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {tab === 'workshops' ? 'جدولة ورشة جديدة' : 'نشر وظيفة جديدة'}
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setTab('workshops')}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition',
            tab === 'workshops' ? activePill : 'bg-secondary text-muted-foreground hover:text-foreground',
          )}
        >
          <GraduationCap className="h-4 w-4" />
          إدارة الورش
        </button>
        <button
          onClick={() => setTab('jobs')}
          className={cn(
            'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition',
            tab === 'jobs' ? activePill : 'bg-secondary text-muted-foreground hover:text-foreground',
          )}
        >
          <Briefcase className="h-4 w-4" />
          إدارة الوظائف
        </button>
      </div>

      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-right text-sm">
            <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
              {tab === 'workshops' ? (
                <tr>
                  <th className="px-5 py-4 font-semibold">عنوان الورشة</th>
                  <th className="px-5 py-4 font-semibold">المدرب</th>
                  <th className="px-5 py-4 font-semibold">التاريخ والوقت</th>
                  <th className="px-5 py-4 font-semibold">المسجلين</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">إجراءات</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-4 font-semibold">العنوان</th>
                  <th className="px-5 py-4 font-semibold">النوع</th>
                  <th className="px-5 py-4 font-semibold">المتقدمين</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">إجراءات</th>
                </tr>
              )}
            </thead>
            <tbody>
              {tab === 'workshops'
                ? workshops.map((w) => (
                    <tr key={w.title} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                      <td className="px-5 py-4 font-bold text-foreground">{w.title}</td>
                      <td className="px-5 py-4 text-muted-foreground">{w.trainer}</td>
                      <td className="px-5 py-4">
                        <div className="text-muted-foreground">{w.date}</div>
                        <div className="mt-1">
                          <RadiusLocator km={w.km} note={w.venue} />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-foreground">{w.seats}</td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', toneClass[w.tone])}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <RowActions
                          entityLabel="الورشة"
                          entityName={w.title}
                          fields={workshopFields(w)}
                          onEdited={(v) =>
                            setWorkshops((prev) => prev.map((x) => (x.title === w.title ? { ...x, ...v } : x)))
                          }
                          onDeleted={() => setWorkshops((prev) => prev.filter((x) => x.title !== w.title))}
                        />
                      </td>
                    </tr>
                  ))
                : jobs.map((j) => (
                    <tr key={j.title} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                      <td className="px-5 py-4 font-bold text-foreground">{j.title}</td>
                      <td className="px-5 py-4 text-accent">{j.type}</td>
                      <td className="px-5 py-4 text-muted-foreground">{j.applicants}</td>
                      <td className="px-5 py-4">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', toneClass[j.tone])}>
                          {j.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <RowActions
                          entityLabel="الوظيفة"
                          entityName={j.title}
                          fields={jobFields(j)}
                          onEdited={(v) =>
                            setJobs((prev) => prev.map((x) => (x.title === j.title ? { ...x, ...v } : x)))
                          }
                          onDeleted={() => setJobs((prev) => prev.filter((x) => x.title !== j.title))}
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
