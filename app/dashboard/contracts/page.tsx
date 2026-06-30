import { ContractHistory } from '@/components/contracts/contract-history'
import { DigitalSignature } from '@/components/contracts/digital-signature'

export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-medium text-accent">العقود الذكية والتوقيعات</p>
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
          إدارة العقود
        </h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-bold text-foreground">التوقيع الرقمي</h2>
          <DigitalSignature />
        </section>

        <section className="glass rounded-2xl border border-border p-5">
          <h2 className="mb-4 text-lg font-bold text-foreground">سجل العقود</h2>
          <ContractHistory />
        </section>
      </div>
    </div>
  )
}
