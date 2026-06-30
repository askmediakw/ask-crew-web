'use client'

import { Component, type ReactNode } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'

// ============================================================================
// GLOBAL ERROR BOUNDARY (#13)
// ----------------------------------------------------------------------------
// Catches any rendering error in the tree and shows a recovery screen that
// nudges the developer toward the real culprit (usually API payload shape).
// ============================================================================

type Props = { children: ReactNode }
type State = { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.log('[v0] ErrorBoundary caught:', error.message)
  }

  reset = () => this.setState({ hasError: false, error: null })

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="flex min-h-[70vh] items-center justify-center p-6">
        <div className="glass w-full max-w-lg rounded-2xl border border-warning/40 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/15">
            <AlertTriangle className="h-8 w-8 text-warning" />
          </div>
          <h2 className="mb-2 text-xl font-black text-foreground">الواجهة الأمامية سليمة</h2>
          <p className="mb-1 text-sm leading-relaxed text-muted-foreground">
            حدث خطأ أثناء عرض هذا القسم. غالباً السبب في بنية البيانات (payload) القادمة من الـ API.
          </p>
          <p className="mb-5 text-sm font-bold text-foreground">
            Frontend is fine — check the API payload structure.
          </p>
          {this.state.error && (
            <pre className="mb-5 max-h-32 overflow-auto rounded-xl border border-border bg-black/40 p-3 text-left font-mono text-xs text-destructive scrollbar-thin">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <RotateCw className="h-4 w-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }
}
