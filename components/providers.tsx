'use client'

import type { ReactNode } from 'react'
import { ExecModeProvider } from '@/lib/exec-mode'
import { EscrowProvider } from '@/lib/escrow-store'
import { FeedbackProvider } from '@/lib/api'
import { ThemeProvider } from '@/lib/theme'
import { LocaleProvider } from '@/lib/locale'
import { CurrencyProvider } from '@/lib/currency'
import { ToastProvider } from '@/lib/toast'
import { ModalProvider } from '@/lib/modal'
import { DevToolsProvider } from '@/lib/dev-tools'
import { MockModeProvider } from '@/lib/mock-mode'

/**
 * Global application providers.
 *
 * Mounted once in the root layout so BOTH the public marketing/auth routes and
 * the protected dashboard routes share the same Theme + i18n (Locale) + Currency
 * context. The dashboard chrome (sidebar/topbar) lives separately in
 * `components/app-shell.tsx`, mounted by `app/dashboard/layout.tsx`.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <CurrencyProvider>
          <MockModeProvider>
            <ExecModeProvider>
              <EscrowProvider>
                <FeedbackProvider>
                  <ToastProvider>
                    <ModalProvider>
                      <DevToolsProvider>{children}</DevToolsProvider>
                    </ModalProvider>
                  </ToastProvider>
                </FeedbackProvider>
              </EscrowProvider>
            </ExecModeProvider>
          </MockModeProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
