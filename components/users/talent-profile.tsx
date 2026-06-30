'use client'

import { Briefcase } from 'lucide-react'
import { RatingsReviews } from '@/components/reviews/ratings-reviews'
import {
  DualFlag,
  VisaBadges,
  LocalTimeBadge,
  UnionTag,
  MatchmakerTag,
  PronunciationButton,
  TranslatedNote,
} from '@/components/shared/geo-widgets'

// Talent profile data. Keyed by user id with a Default fallback so unknown
// users still render a sensible card. TODO: BACKEND — replace with real data.
export type TalentProfile = {
  role: string
  nationality: string
  residence: string
  residenceLabel: string
  /** IANA timezone used to render a live local-time clock (#12). */
  timezone: string
  union?: string
  speaksProjectLang?: string
  bio: string
  bioTranslatedFrom?: string
  visas: { label: string; flag: string; ready: boolean }[]
}

const PROFILES: Record<number, TalentProfile> = {
  1: {
    role: 'منتجة تنفيذية',
    nationality: '🇪🇬',
    residence: '🇰🇼',
    residenceLabel: 'مقيمة في الكويت',
    timezone: 'Asia/Kuwait',
    union: 'SAG-AFTRA',
    speaksProjectLang: 'العربية',
    bio: 'منتجة تنفيذية بخبرة 12 عاماً في الدراما الخليجية والإعلانات التجارية.',
    visas: [
      { label: 'شينغن', flag: '🇪🇺', ready: true },
      { label: 'فيزا أمريكية', flag: '🇺🇸', ready: false },
    ],
  },
  3: {
    role: 'مخرجة فنية',
    nationality: '🇱🇧',
    residence: '🇦🇪',
    residenceLabel: 'مقيمة في الإمارات',
    timezone: 'Asia/Dubai',
    union: 'DGA',
    speaksProjectLang: 'العربية',
    bio: 'Art director specialized in cinematic branding and music videos.',
    bioTranslatedFrom: 'الإنجليزية',
    visas: [
      { label: 'شينغن', flag: '🇪🇺', ready: true },
      { label: 'فيزا أمريكية', flag: '🇺🇸', ready: true },
    ],
  },
  5: {
    role: 'مديرة تصوير',
    nationality: '🇰🇼',
    residence: '🇰🇼',
    residenceLabel: 'مقيمة في الكويت',
    timezone: 'Asia/Kuwait',
    speaksProjectLang: 'العربية',
    bio: 'مديرة تصوير حائزة على جوائز في المهرجانات السينمائية الخليجية.',
    visas: [{ label: 'شينغن', flag: '🇪🇺', ready: false }],
  },
}

const DEFAULT_PROFILE: TalentProfile = {
  role: 'عضو في المنصة',
  nationality: '🇰🇼',
  residence: '🇰🇼',
  residenceLabel: 'مقيم في الكويت',
  timezone: 'Asia/Kuwait',
  bio: 'لا يوجد وصف تعريفي بعد.',
  visas: [],
}

export function talentProfileOf(userId: number): TalentProfile {
  return PROFILES[userId] ?? DEFAULT_PROFILE
}

export function TalentProfileContent({ userId, userName }: { userId: number; userName: string }) {
  const p = talentProfileOf(userId)

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-black text-foreground">{userName}</h3>
            <PronunciationButton name={userName} />
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            {p.role}
          </p>
          <div className="mt-1.5">
            <DualFlag
              nationality={p.nationality}
              residence={p.residence}
              residenceLabel={p.residenceLabel}
            />
          </div>
        </div>
        <LocalTimeBadge timezone={p.timezone} />
      </div>

      {/* Credibility badges */}
      <div className="flex flex-wrap gap-2">
        {p.union && <UnionTag union={p.union} />}
        {p.speaksProjectLang && <MatchmakerTag language={p.speaksProjectLang} />}
      </div>

      {/* Visa readiness */}
      {p.visas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted-foreground">جاهزية الفيزا (Visa Status)</p>
          <VisaBadges visas={p.visas} />
        </div>
      )}

      {/* Bio / portfolio */}
      <div className="space-y-1.5 rounded-xl border border-border bg-white/5 p-4">
        <p className="text-xs font-bold text-muted-foreground">النبذة التعريفية</p>
        <p className="text-sm leading-relaxed text-foreground">{p.bio}</p>
        {p.bioTranslatedFrom && <TranslatedNote from={p.bioTranslatedFrom} />}
      </div>

      {/* Ratings & reviews (#43) */}
      <div className="border-t border-border pt-4">
        <RatingsReviews profileName={userName} />
      </div>
    </div>
  )
}
