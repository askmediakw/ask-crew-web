import { PublicNav } from '@/components/public/public-nav'

export const metadata = {
  title: 'من نحن · ASK CREW',
  description: 'تعرّف على منصة ASK CREW ورسالتها في تمكين صنّاع المحتوى والمواهب.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PublicNav />
      <main className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <h1 className="text-4xl font-black tracking-tight md:text-5xl">من نحن</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          ASK CREW منصة متكاملة تربط المواهب وشركات الإنتاج عبر الخليج والعالم، وتوفّر
          أدوات الإدارة والعقود والمدفوعات في مكان واحد.
        </p>
        {/* TODO: flesh out story, team, mission sections. */}
        <p className="mt-4 leading-relaxed text-muted-foreground">
          هذه صفحة تعريفية مبدئية ضمن هيكل المنصة، وسيتم إثراؤها بالمحتوى لاحقاً.
        </p>
      </main>
    </div>
  )
}
