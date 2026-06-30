'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

// ============================================================================
// UNIVERSAL MODAL / DIALOG (#3)
// ----------------------------------------------------------------------------
// const { openModal, closeModal, confirm } = useModal()
// openModal({ title, content: <AnyJSX/> })
// const ok = await confirm({ title, message }) // returns Promise<boolean>
// ============================================================================

type ModalContent = {
  title?: string
  content?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

type ConfirmOptions = {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

type ModalContextValue = {
  openModal: (c: ModalContent) => void
  closeModal: () => void
  confirm: (o: ConfirmOptions) => Promise<boolean>
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal must be used within <ModalProvider>')
  return ctx
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalContent | null>(null)
  const [confirmState, setConfirmState] = useState<
    (ConfirmOptions & { resolve: (v: boolean) => void }) | null
  >(null)

  const openModal = useCallback((c: ModalContent) => setModal(c), [])
  const closeModal = useCallback(() => setModal(null), [])

  const confirm = useCallback(
    (o: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...o, resolve })),
    [],
  )

  const resolveConfirm = (v: boolean) => {
    confirmState?.resolve(v)
    setConfirmState(null)
  }

  return (
    <ModalContext.Provider value={{ openModal, closeModal, confirm }}>
      {children}

      {modal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className={`glass w-full ${sizeMap[modal.size ?? 'md']} rounded-2xl border border-border p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="text-lg font-black text-foreground">{modal.title}</h3>
              <button
                onClick={closeModal}
                className="rounded-lg p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-sm text-foreground">{modal.content}</div>
          </div>
        </div>
      )}

      {confirmState && (
        <div
          className="fixed inset-0 z-[115] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => resolveConfirm(false)}
        >
          <div
            className="glass w-full max-w-sm rounded-2xl border border-border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 text-lg font-black text-foreground">
              {confirmState.title ?? 'تأكيد الإجراء'}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{confirmState.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => resolveConfirm(true)}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 ${
                  confirmState.danger ? 'bg-destructive' : 'bg-primary'
                }`}
              >
                {confirmState.confirmLabel ?? 'تأكيد'}
              </button>
              <button
                onClick={() => resolveConfirm(false)}
                className="flex-1 rounded-xl border border-border bg-white/5 px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-white/10"
              >
                {confirmState.cancelLabel ?? 'إلغاء'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
