'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

// Supported display currencies. Base accounting currency is always KWD.
export type CurrencyCode = 'KWD' | 'SAR' | 'AED' | 'EGP' | 'USD'

export const CURRENCY_META: Record<
  CurrencyCode,
  { label: string; symbol: string; locale: string }
> = {
  KWD: { label: 'دينار كويتي', symbol: 'د.ك', locale: 'ar-KW' },
  SAR: { label: 'ريال سعودي', symbol: 'ر.س', locale: 'ar-SA' },
  AED: { label: 'درهم إماراتي', symbol: 'د.إ', locale: 'ar-AE' },
  EGP: { label: 'جنيه مصري', symbol: 'ج.م', locale: 'ar-EG' },
  USD: { label: 'دولار أمريكي', symbol: '$', locale: 'en-US' },
}

// Fallback static rates (1 KWD -> X). Overwritten at runtime by /api/currency/rates.
const FALLBACK_RATES: Record<CurrencyCode, number> = {
  KWD: 1,
  SAR: 12.25,
  AED: 11.99,
  EGP: 161.5,
  USD: 3.26,
}

type CurrencyContextValue = {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  rates: Record<CurrencyCode, number>
  /** Convert a KWD amount into the active currency. */
  convert: (amountKwd: number) => number
  /** Convert + format with the active currency symbol. */
  format: (amountKwd: number, opts?: { fromCurrency?: CurrencyCode }) => string
  isLive: boolean
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

const STORAGE_KEY = 'askcrew.currency'

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>('KWD')
  const [rates, setRates] = useState<Record<CurrencyCode, number>>(FALLBACK_RATES)
  const [isLive, setIsLive] = useState(false)

  // Restore saved preference.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
    if (saved && saved in CURRENCY_META) setCurrencyState(saved)
  }, [])

  // Pull live rates from the (mock-fallback) API once on mount.
  useEffect(() => {
    let active = true
    fetch('/api/currency/rates')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!active || !data?.rates) return
        setRates({ ...FALLBACK_RATES, ...data.rates })
        setIsLive(Boolean(data.live))
      })
      .catch(() => {
        /* keep fallback rates */
      })
    return () => {
      active = false
    }
  }, [])

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c)
    localStorage.setItem(STORAGE_KEY, c)
  }

  const convert = (amountKwd: number) => amountKwd * (rates[currency] ?? 1)

  const format: CurrencyContextValue['format'] = (amount, opts) => {
    const from = opts?.fromCurrency ?? 'KWD'
    // Normalize the source amount back to KWD first, then to active currency.
    const amountKwd = from === 'KWD' ? amount : amount / (rates[from] ?? 1)
    const value = amountKwd * (rates[currency] ?? 1)
    const meta = CURRENCY_META[currency]
    const decimals = currency === 'KWD' ? 3 : currency === 'EGP' ? 0 : 2
    return `${value.toLocaleString(meta.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })} ${meta.symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, convert, format, isLive }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}
