import Link from 'next/link'
import { Clapperboard } from 'lucide-react'

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/about', label: 'من نحن' },
  { href: '/pricing', label: 'الأسعار' },
]

/**
 * Public marketing navigation. Used by the public routes (/, /about, /pricing).
 * Distinct from the dashboard sidebar — keeps the landing surface lightweight.
 */
export function PublicNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Clapperboard className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-tight text-foreground">ASK CREW</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2 text-sm font-bold text-foreground transition hover:bg-white/5"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition hover:opacity-90"
          >
            ابدأ الآن
          </Link>
        </div>
      </div>
    </header>
  )
}
