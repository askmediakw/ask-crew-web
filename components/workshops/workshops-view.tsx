'use client'

import { useState, useEffect } from 'react'
import { GraduationCap, Plus, Briefcase, RotateCcw, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { WorkshopForm, JobForm } from '@/components/shared/add-entity-forms'
import { RadiusLocator } from '@/components/shared/geo-widgets'
import { RowActions, type CrudField } from '@/components/shared/crud'
import api, { apiRequest } from '@/lib/api'

type Workshop = { 
  id: number; 
  name: string; 
  description?: string; 
  cover_image?: string; 
  created_by?: number; 
  created_by_email?: string; 
  created_by_fullname?: string; 
  created_by_photo?: string; 
  location?: string; 
  start_date: string; 
  end_date: string; 
  specialization?: string; 
  number_of_participants?: number; 
  is_active: boolean; 
  is_approved: boolean; 
  approved_at?: string; 
  approved_by?: number; 
  created_at: string; 
  updated_at: string; 
  applications_count?: number; 
  approved_applications_count?: number; 
}

type Job = { 
  id: number; 
  company_name: string; 
  job_title: string; 
  image?: string; 
  about: string; 
  is_active: boolean; 
  is_approved: boolean; 
  approved_at?: string; 
  approved_by?: number; 
  author?: number; 
  author_name?: string; 
  author_roles?: string[]; 
  applications_count?: number; 
  applied?: boolean; 
  created_at: string; 
  updated_at: string; 
}

const toneClass: Record<string, string> = {
  success: 'bg-success/20 text-success',
  muted: 'bg-secondary/50 text-muted-foreground',
}

const workshopFields = (w?: Workshop): CrudField[] => [
  { key: 'name', label: 'اسم الورشة', value: w?.name, full: true, placeholder: 'مثال: أساسيات الإخراج' },
  { key: 'description', label: 'الوصف', value: w?.description, full: true, type: 'textarea', placeholder: 'وصف الورشة' },
  { key: 'cover_image', label: 'صورة الغلاف (URL)', value: w?.cover_image, full: true, placeholder: 'https://example.com/image.jpg' },
  { key: 'specialization', label: 'التخصص', value: w?.specialization, placeholder: 'مثال: السينما' },
  { key: 'location', label: 'الموقع', value: w?.location, placeholder: 'مدينة الكويت' },
  { key: 'start_date', label: 'تاريخ البدء', value: w?.start_date, type: 'date', placeholder: '2024-01-15' },
  { key: 'end_date', label: 'تاريخ الانتهاء', value: w?.end_date, type: 'date', placeholder: '2024-01-20' },
  { key: 'number_of_participants', label: 'عدد المشاركين', value: w?.number_of_participants !== undefined ? String(w.number_of_participants) : undefined, type: 'number', placeholder: '50' },
  { key: 'is_active', label: 'نشط', value: w?.is_active ? 'true' : 'false', type: 'select', options: [{ value: 'true', label: 'نعم' }, { value: 'false', label: 'لا' }] },
  { key: 'is_approved', label: 'معتمد', value: w?.is_approved ? 'true' : 'false', type: 'select', options: [{ value: 'true', label: 'نعم' }, { value: 'false', label: 'لا' }] },
]

const jobFields = (j?: Job): CrudField[] => [
  { key: 'job_title', label: 'المسمى الوظيفي', value: j?.job_title, full: true, placeholder: 'مثال: مطلوب محرر فيديو' },
  { key: 'company_name', label: 'اسم الشركة', value: j?.company_name, placeholder: 'شركة الإبداع' },
  { key: 'image', label: 'صورة الوظيفة (URL)', value: j?.image, full: true, placeholder: 'https://example.com/image.jpg' },
  { key: 'about', label: 'عن الوظيفة', value: j?.about, full: true, type: 'textarea', placeholder: 'وصف الوظيفة' },
  { key: 'is_active', label: 'نشط', value: j?.is_active ? 'true' : 'false', type: 'select', options: [{ value: 'true', label: 'نعم' }, { value: 'false', label: 'لا' }] },
  { key: 'is_approved', label: 'معتمد', value: j?.is_approved ? 'true' : 'false', type: 'select', options: [{ value: 'true', label: 'نعم' }, { value: 'false', label: 'لا' }] },
]

export function WorkshopsView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const [tab, setTab] = useState<'workshops' | 'jobs'>('workshops')
  const [workshops, setWorkshops] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const accent = execMode ? 'text-destructive' : 'text-primary'
  const activePill = execMode ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground'

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [workshopsRes, jobsRes] = await Promise.all([
        api.fetchWorkshops(),
        api.fetchJobs(),
      ])
      console.log('API Responses:', { workshopsRes, jobsRes })
      
      // Handle paginated responses (extract results array)
      setWorkshops(Array.isArray(workshopsRes) ? workshopsRes : ((workshopsRes as any)?.results || []))
      setJobs(Array.isArray(jobsRes) ? jobsRes : ((jobsRes as any)?.results || []))
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  const deleteWorkshop = async (id: number) => {
    try {
      await api.deleteWorkshop(id)
      await fetchAllData()
    } catch (err) {
      console.error('Failed to delete workshop:', err)
    }
  }

  const deleteJob = async (id: number) => {
    try {
      await api.deleteJob(id)
      await fetchAllData()
    } catch (err) {
      console.error('Failed to delete job:', err)
    }
  }

  const editWorkshop = (workshop: any) => {
    console.log('Edit workshop:', workshop)
    // TODO: Implement edit modal for workshops
  }

  const editJob = (job: any) => {
    console.log('Edit job:', job)
    // TODO: Implement edit modal for jobs
  }

  const viewRegistrations = async (workshopId: number, workshopName: string) => {
    try {
      // Fetch registrations for this workshop
      const response = await api.fetchWorkshopRegistrations(workshopId)
      const registrations = Array.isArray(response) ? response : ((response as any)?.results || [])
      
      openModal({
        title: `المسجلين في ورشة: ${workshopName}`,
        content: (
          <div className="space-y-4">
            {registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا يوجد مسجلين حالياً</p>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg: any) => (
                  <div key={reg.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                    {reg.user_photo && (
                      <img 
                        src={reg.user_photo} 
                        alt="" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{reg.user_fullname || reg.user_email}</div>
                      <div className="text-sm text-muted-foreground">{reg.user_email}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-muted-foreground">التقييم</div>
                      <div className="font-medium">{reg.user_rating_mean?.toFixed(1) || '0.0'} ({reg.user_rating_count || 0})</div>
                    </div>
                    <div>
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold',
                        reg.status === 'approved' ? toneClass.success : 
                        reg.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                        'bg-warning/20 text-warning'
                      )}>
                        {reg.status === 'approved' ? 'مقبول' : reg.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    } catch (err) {
      console.error('Failed to fetch registrations:', err)
    }
  }

  const viewJobApplications = async (jobId: number, jobTitle: string) => {
    try {
      // Fetch applications for this job
      const response = await api.fetchJobApplications()
      const applications = Array.isArray(response) ? response : ((response as any)?.results || [])
      const jobApplications = applications.filter((app: any) => app.job === jobId)
      
      openModal({
        title: `المتقدمين لوظيفة: ${jobTitle}`,
        content: (
          <div className="space-y-4">
            {jobApplications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">لا يوجد متقدمين حالياً</p>
            ) : (
              <div className="space-y-3">
                {jobApplications.map((app: any) => (
                  <div key={app.id} className="flex items-center gap-4 rounded-lg border border-border p-3">
                    {app.applicant_image && (
                      <img 
                        src={app.applicant_image} 
                        alt="" 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{app.applicant_name || 'غير معروف'}</div>
                    </div>
                    <div>
                      <span className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold',
                        app.status === 'accepted' ? toneClass.success : 
                        app.status === 'rejected' ? 'bg-destructive/20 text-destructive' : 
                        'bg-warning/20 text-warning'
                      )}>
                        {app.status === 'accepted' ? 'مقبول' : app.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ),
      })
    } catch (err) {
      console.error('Failed to fetch job applications:', err)
    }
  }

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
        <div className="flex gap-3">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-secondary/80"
          >
            <RotateCcw className="h-4 w-4" />
            تحديث
          </button>
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
            <thead className="border-b border-border bg-secondary/30 text-xs uppercase tracking-wider text-muted-foreground">
              {tab === 'workshops' ? (
                <tr>
                  <th className="px-5 py-4 font-semibold">صورة الغلاف</th>
                  <th className="px-5 py-4 font-semibold">اسم الورشة</th>
                  <th className="px-5 py-4 font-semibold">المنشئ</th>
                  <th className="px-5 py-4 font-semibold">التخصص</th>
                  <th className="px-5 py-4 font-semibold">الموقع</th>
                  <th className="px-5 py-4 font-semibold">تاريخ البدء</th>
                  <th className="px-5 py-4 font-semibold">تاريخ الانتهاء</th>
                  <th className="px-5 py-4 font-semibold">المشاركون</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">إجراءات</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-5 py-4 font-semibold">صورة</th>
                  <th className="px-5 py-4 font-semibold">المسمى الوظيفي</th>
                  <th className="px-5 py-4 font-semibold">الشركة</th>
                  <th className="px-5 py-4 font-semibold">المنشئ</th>
                  <th className="px-5 py-4 font-semibold">المتقدمين</th>
                  <th className="px-5 py-4 font-semibold">الحالة</th>
                  <th className="px-5 py-4 font-semibold">إجراءات</th>
                </tr>
              )}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={tab === 'workshops' ? 10 : 7} className="px-5 py-10 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : tab === 'workshops' ? (
                workshops.map((w) => (
                  <tr key={w.id} className="border-b border-border/60 transition last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      {w.cover_image ? (
                        <img 
                          src={w.cover_image} 
                          alt="" 
                          className="h-12 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground text-xs">
                          لا توجد صورة
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">{w.name}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {w.created_by_photo && (
                          <img 
                            src={w.created_by_photo} 
                            alt="" 
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        )}
                        <span>{w.created_by_fullname || w.created_by_email || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{w.specialization || '-'}</td>
                    <td className="px-5 py-4 text-muted-foreground">{w.location || '-'}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div>{new Date(w.start_date).toLocaleDateString('en-US')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(w.start_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div>{new Date(w.end_date).toLocaleDateString('en-US')}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(w.end_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-foreground">
                      {w.approved_applications_count || 0} / {w.number_of_participants || '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', w.is_active && w.is_approved ? toneClass.success : toneClass.muted)}>
                        {w.is_approved ? (w.is_active ? 'نشط' : 'منتهي') : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewRegistrations(w.id, w.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
                          aria-label="المسجلين"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <RowActions
                          entityLabel="الورشة"
                          entityName={w.name}
                          fields={workshopFields(w)}
                          onEdited={(v) => {
                            editWorkshop({ ...w, ...v })
                          }}
                          onDeleted={() => deleteWorkshop(w.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                jobs.map((j) => (
                  <tr key={j.id} className="border-b border-border/60 transition last:border-0 hover:bg-secondary/30">
                    <td className="px-5 py-4">
                      {j.image ? (
                        <img
                          src={j.image}
                          alt=""
                          className="h-12 w-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-16 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground text-xs">
                          لا توجد صورة
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-foreground">{j.job_title}</td>
                    <td className="px-5 py-4 text-accent">{j.company_name || '-'}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span>{j.author_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{j.applications_count || 0} سيرة ذاتية</td>
                    <td className="px-5 py-4">
                      <span className={cn('rounded-full px-2.5 py-1 text-xs font-bold', j.is_active ? toneClass.success : toneClass.muted)}>
                        {j.is_active ? 'نشط' : 'مغلق'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewJobApplications(j.id, j.job_title)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-secondary/50 hover:text-foreground"
                          aria-label="المتقدمين"
                        >
                          <Users className="h-4 w-4" />
                        </button>
                        <RowActions
                          entityLabel="الوظيفة"
                          entityName={j.job_title}
                          fields={jobFields(j)}
                          onEdited={(v) => {
                            editJob({ ...j, ...v })
                          }}
                          onDeleted={() => deleteJob(j.id)}
                        />
                      </div>
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
