'use client'

import { useState } from 'react'
import { FileText, PenLine, History } from 'lucide-react'
import { BilingualContractButton, VATWarning } from '@/components/shared/geo-widgets'
import { DigitalSignature } from '@/components/contracts/digital-signature'
import { ContractHistory } from '@/components/contracts/contract-history'
import { cn } from '@/lib/utils'

// Contract management modal — bilingual view toggle (#8) + cross-border VAT
// disclaimer (#17). Contract body is illustrative; real terms wired later.
const CLAUSE_AR =
  'يوافق الطرف الأول على تقديم الخدمات الإنتاجية المتفق عليها وفقاً للجدول الزمني المحدد، مع الالتزام بمعايير الجودة المعتمدة لدى منصة Ask Crew.'
const CLAUSE_EN =
  'The first party agrees to provide the agreed production services according to the specified timeline, adhering to the quality standards approved by the Ask Crew platform.'

export function ContractModalContent({
  companyName,
  freelancerCountry = 'الإمارات',
}: {
  companyName: string
  freelancerCountry?: string
}) {
  const [bilingual, setBilingual] = useState(false)
  const [tab, setTab] = useState<'contract' | 'sign' | 'history'>('contract')

  const tabs = [
    { id: 'contract' as const, label: 'العقد', Icon: FileText },
    { id: 'sign' as const, label: 'التوقيع الرقمي', Icon: PenLine },
    { id: 'history' as const, label: 'السجل', Icon: History },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4 text-primary" />
        عقد خدمة إنتاجية — {companyName}
      </div>

      <div className="flex gap-1 rounded-xl border border-border bg-secondary p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition',
              tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <t.Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'history' ? (
        <ContractHistory />
      ) : tab === 'sign' ? (
        <DigitalSignature />
      ) : (
        <ContractBody
          bilingual={bilingual}
          onToggle={() => setBilingual((b) => !b)}
          freelancerCountry={freelancerCountry}
        />
      )}
    </div>
  )
}

function ContractBody({
  bilingual,
  onToggle,
  freelancerCountry,
}: {
  bilingual: boolean
  onToggle: () => void
  freelancerCountry: string
}) {
  return (
    <div className="space-y-5">
      <BilingualContractButton onClick={onToggle} />

      <div className="rounded-xl border border-border bg-white/5 p-4">
        {bilingual ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2" dir="rtl">
              <p className="text-xs font-bold text-muted-foreground">العربية</p>
              <p className="text-sm leading-relaxed text-foreground">{CLAUSE_AR}</p>
            </div>
            <div className="space-y-2 border-t border-border pt-4 md:border-r md:border-t-0 md:pr-4 md:pt-0" dir="ltr">
              <p className="text-xs font-bold text-muted-foreground">English</p>
              <p className="text-sm leading-relaxed text-foreground">{CLAUSE_EN}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground" dir="rtl">
            {CLAUSE_AR}
          </p>
        )}
      </div>

      <VATWarning country={freelancerCountry} />
    </div>
  )
}
