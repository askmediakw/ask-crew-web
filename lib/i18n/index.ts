'use client'

// ============================================================================
// i18n (react-i18next) — full UI translation layer
// ----------------------------------------------------------------------------
// A single global i18next instance loaded with the `ar` and `en` resource
// bundles. The active language is driven by <LocaleProvider> (the single
// source of truth for locale + direction), which calls i18n.changeLanguage()
// whenever the user switches languages.
//
// Usage in any client component:
//   const { t } = useTranslation()
//   t('plans.title')                 // -> "إدارة الباقات..." / "Packages..."
//   t(`nav.${item.key}`)
// ============================================================================

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './messages/ar.json'
import en from './messages/en.json'

export const SUPPORTED_LOCALES = ['ar', 'en'] as const

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar',
    fallbackLng: 'ar',
    defaultNS: 'translation',
    interpolation: { escapeValue: false }, // React already escapes
    react: { useSuspense: false },
  })
}

export default i18n
