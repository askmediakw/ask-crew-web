'use client'

import { Gift, Ticket, Plus, Award, TrendingUp, Edit, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExecMode } from '@/lib/exec-mode'
import { useModal } from '@/lib/modal'
import { useToast } from '@/lib/toast'
import apiServices, { RewardType, RewardCodeType, PointsHistoryType } from '@/lib/api'
import { useEffect, useState, type ReactNode } from 'react'

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

function RewardForm({ reward, onSuccess, isEdit = false }: { reward?: RewardType; onSuccess: () => void; isEdit?: boolean }) {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [name, setName] = useState(reward?.name || '')
  const [description, setDescription] = useState(reward?.description || '')
  const [points, setPoints] = useState(reward?.points.toString() || '')
  const [image, setImage] = useState(reward?.image || '')
  const [contentType, setContentType] = useState(reward?.content || 'movie')
  const [rate, setRate] = useState(reward?.rate.toString() || '1')
  const [isActive, setIsActive] = useState(reward?.is_active ?? true)

  const save = async () => {
    try {
      if (isEdit && reward) {
        await apiServices.updateReward(reward.id, {
          name,
          description,
          points: Number(points),
          image,
          content: contentType as any,
          rate: Number(rate),
          is_active: isActive
        })
        toast.success(`تم تحديث الجائزة: ${name}`)
      } else {
        await apiServices.createReward({
          name,
          description,
          points: Number(points),
          image,
          content: contentType as any,
          rate: Number(rate),
          is_active: isActive
        })
        toast.success(`تم إنشاء الجائزة: ${name}`)
      }
      onSuccess()
      closeModal()
    } catch (error) {
      toast.error(isEdit ? 'حدث خطأ أثناء تحديث الجائزة' : 'حدث خطأ أثناء إنشاء الجائزة')
      console.error(error)
    }
  }

  const valid = name.trim() && description.trim() && Number(points) > 0

  return (
    <FormShell onSave={save} saveLabel={isEdit ? "تحديث الجائزة" : "إنشاء الجائزة"} saveClass="bg-success text-white" disabled={!valid}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <FieldLabel>اسم الجائزة</FieldLabel>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="مثال: اشتراك مجاني لمدة شهر" />
        </div>
        <div className="md:col-span-2">
          <FieldLabel>الوصف</FieldLabel>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-base h-24 resize-none" placeholder="وصف الجائزة..." />
        </div>
        <div>
          <FieldLabel>النقاط المطلوبة</FieldLabel>
          <input type="number" min="1" value={points} onChange={(e) => setPoints(e.target.value)} className="input-base" placeholder="مثال: 500" />
        </div>
        <div>
          <FieldLabel>نوع المحتوى</FieldLabel>
          <select value={contentType} onChange={(e) => setContentType(e.target.value as any)} className="input-base">
            <option value="movie">فيلم</option>
            <option value="advertise">إعلان</option>
            <option value="season">مسلسل</option>
            <option value="all_content">كل المحتوى</option>
            <option value="booking">حجز</option>
          </select>
        </div>
        <div>
          <FieldLabel>المعدل</FieldLabel>
          <input type="number" min="1" value={rate} onChange={(e) => setRate(e.target.value)} className="input-base" placeholder="1" />
        </div>
        <div>
          <FieldLabel>صورة الجائزة (URL)</FieldLabel>
          <input type="url" dir="ltr" value={image} onChange={(e) => setImage(e.target.value)} className="input-base text-left" placeholder="https://example.com/image.jpg" />
        </div>
        <div>
          <FieldLabel>نشط</FieldLabel>
          <select value={String(isActive)} onChange={(e) => setIsActive(e.target.value === 'true')} className="input-base">
            <option value="true">نعم</option>
            <option value="false">لا</option>
          </select>
        </div>
      </div>
    </FormShell>
  )
}

function RewardCodeForm({ rewardCode, onSuccess, isEdit = false }: { rewardCode?: RewardCodeType; onSuccess: () => void; isEdit?: boolean }) {
  const { closeModal } = useModal()
  const { toast } = useToast()
  const [rewards, setRewards] = useState<RewardType[]>([])
  const [selectedReward, setSelectedReward] = useState(rewardCode?.reward.id.toString() || '')
  const [code, setCode] = useState(rewardCode?.code || '')
  const [isActive, setIsActive] = useState(rewardCode?.is_active ?? true)

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const data = await apiServices.fetchRewards()
        setRewards(data)
        if (!isEdit && data.length > 0) setSelectedReward(String(data[0].id))
      } catch (error) {
        console.error('Error fetching rewards:', error)
      }
    }
    fetchRewards()
  }, [isEdit])

  const save = async () => {
    if (!selectedReward) return
    try {
      if (isEdit && rewardCode) {
        await apiServices.updateRewardCode(rewardCode.id, {
          code,
          is_active: isActive
        })
        toast.success(`تم تحديث الكود: ${code}`)
      } else {
        await apiServices.createRewardCode({
          reward: Number(selectedReward),
          code,
          is_active: isActive
        })
        toast.success(`تم إنشاء الكود: ${code}`)
      }
      onSuccess()
      closeModal()
    } catch (error) {
      toast.error(isEdit ? 'حدث خطأ أثناء تحديث الكود' : 'حدث خطأ أثناء إنشاء الكود')
      console.error(error)
    }
  }

  const valid = code.trim() && selectedReward

  return (
    <FormShell onSave={save} saveLabel={isEdit ? "تحديث الكود" : "إنشاء الكود"} saveClass="bg-success text-white" disabled={!valid}>
      <div>
        <FieldLabel>الجائزة</FieldLabel>
        <select value={selectedReward} onChange={(e) => setSelectedReward(e.target.value)} className="input-base" disabled={isEdit}>
          {rewards.map((reward) => (
            <option key={reward.id} value={reward.id}>{reward.name}</option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel>الكود</FieldLabel>
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="input-base text-center font-bold uppercase tracking-widest" placeholder="SUMMER2026" />
      </div>
      <div>
        <FieldLabel>نشط</FieldLabel>
        <select value={String(isActive)} onChange={(e) => setIsActive(e.target.value === 'true')} className="input-base">
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      </div>
    </FormShell>
  )
}

export function RewardsView() {
  const { execMode } = useExecMode()
  const { openModal } = useModal()
  const { toast } = useToast()
  const accent = execMode ? 'text-destructive' : 'text-primary'

  const [rewards, setRewards] = useState<RewardType[]>([])
  const [rewardCodes, setRewardCodes] = useState<RewardCodeType[]>([])
  const [pointsHistory, setPointsHistory] = useState<PointsHistoryType[]>([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const loadData = async () => {
    setLoading(true)
    try {
      const [rewardsData, codesData, historyData] = await Promise.all([
        apiServices.fetchRewards(),
        apiServices.fetchRewardCodes(),
        apiServices.fetchPointsHistory()
      ])
      setRewards(rewardsData)
      setRewardCodes(codesData)
      setPointsHistory(historyData)
    } catch (error) {
      console.error('Error loading rewards data:', error)
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

  const deleteReward = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الجائزة؟')) {
      try {
        await apiServices.deleteReward(id)
        toast.success('تم حذف الجائزة بنجاح')
        reload()
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الجائزة')
        console.error(error)
      }
    }
  }

  const deleteRewardCode = async (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الكود؟')) {
      try {
        await apiServices.deleteRewardCode(id)
        toast.success('تم حذف الكود بنجاح')
        reload()
      } catch (error) {
        toast.error('حدث خطأ أثناء حذف الكود')
        console.error(error)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
            <Award className={cn('h-6 w-6', accent)} />
            نظام الجوائز وأكواد الخصم
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">إدارة المكافآت والكوبونات الترويجية للمستخدمين.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => openModal({ title: 'إنشاء جائزة جديدة', content: <RewardForm onSuccess={reload} />, size: 'lg' })}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90',
              execMode ? 'bg-destructive shadow-destructive/20' : 'bg-primary shadow-primary/20',
            )}
          >
            <Plus className="h-4 w-4" />
            إنشاء جائزة
          </button>
          <button
            onClick={() => openModal({ title: 'إنشاء كود جائزة', content: <RewardCodeForm onSuccess={reload} />, size: 'sm' })}
            className={cn(
              'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90',
              execMode ? 'bg-destructive shadow-destructive/20' : 'bg-success shadow-success/20',
            )}
          >
            <Plus className="h-4 w-4" />
            إنشاء كود
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Rewards */}
        <div className="glass relative overflow-hidden rounded-2xl border border-border p-6">
          <Gift className="absolute -left-4 -top-4 h-24 w-24 text-foreground/5" />
          <div className="relative">
            <h3 className="text-lg font-bold text-foreground">الجوائز النشطة</h3>
            <p className="mb-4 text-sm text-muted-foreground">إدارة المكافآت للمستخدمين المتميزين.</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : rewards.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">لا توجد جوائز بعد</p>
              ) : (
                rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-3"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-bold text-foreground">{reward.name}</span>
                      <p className="text-[10px] text-muted-foreground">{reward.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-left mr-4">
                        <p className="text-xs font-bold text-success">{reward.points} نقطة</p>
                        <span
                          className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded',
                            reward.is_active ? 'bg-success/20 text-success' : 'bg-white/10 text-muted-foreground'
                          )}
                        >
                          {reward.is_active ? 'فعال' : 'غير فعال'}
                        </span>
                      </div>
                      <button
                        onClick={() => openModal({ title: 'تعديل الجائزة', content: <RewardForm reward={reward} onSuccess={reload} isEdit={true} />, size: 'lg' })}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteReward(reward.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Reward Codes */}
        <div className="glass relative overflow-hidden rounded-2xl border border-border p-6">
          <Ticket className="absolute -left-4 -top-4 h-24 w-24 text-foreground/5" />
          <div className="relative">
            <h3 className="text-lg font-bold text-foreground">أكواد الجوائز</h3>
            <p className="mb-4 text-sm text-muted-foreground">إدارة الأكواد المستخدمة للاستبدال.</p>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : rewardCodes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">لا توجد أكواد بعد</p>
              ) : (
                rewardCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-white/5 p-3"
                  >
                    <div className="flex-1">
                      <span className="font-black tracking-widest text-gold">{code.code}</span>
                      <p className="text-[10px] text-muted-foreground">
                        {code.reward?.name || 'مكافأة غير محددة'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded px-2 py-1 text-xs font-bold mr-4',
                          code.is_active ? 'bg-success/20 text-success' : 'bg-white/10 text-muted-foreground',
                        )}
                      >
                        {code.is_active ? 'فعال' : 'منتهٍ'}
                      </span>
                      <button
                        onClick={() => openModal({ title: 'تعديل الكود', content: <RewardCodeForm rewardCode={code} onSuccess={reload} isEdit={true} />, size: 'sm' })}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        onClick={() => deleteRewardCode(code.id)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Points History */}
      <div className="glass overflow-hidden rounded-2xl border border-border">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <TrendingUp className={cn('h-5 w-5', accent)} />
            سجل النقاط
          </h3>
        </div>
        <div className="overflow-x-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : pointsHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center p-8">لا يوجد سجل للنقاط بعد</p>
          ) : (
            <table className="w-full min-w-[560px] text-right text-sm">
              <thead className="border-b border-border bg-white/5 text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-background/95 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-4 font-semibold">العنوان</th>
                  <th className="px-5 py-4 font-semibold">المستخدم</th>
                  <th className="px-5 py-4 font-semibold">النقاط</th>
                  <th className="px-5 py-4 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {pointsHistory.map((history) => (
                  <tr key={history.id} className="border-b border-border/60 transition last:border-0 hover:bg-white/5">
                    <td className="px-5 py-4 font-bold text-foreground">{history.title}</td>
                    <td className="px-5 py-4 text-muted-foreground">#{history.user}</td>
                    <td className={cn(
                      'px-5 py-4 font-bold',
                      history.points > 0 ? 'text-success' : 'text-destructive'
                    )}>
                      {history.points > 0 ? '+' : ''}{history.points}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground text-xs">
                      {new Date(history.created_at).toLocaleDateString('ar-EG')}
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
