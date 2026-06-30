'use client'

import { Wrench } from 'lucide-react'
import { EndpointTester } from '@/components/dev/endpoint-tester'
import { AuthTokenDecoder } from '@/components/dev/auth-token-decoder'
import { WebhookListener } from '@/components/dev/webhook-listener'
import { EnvChecker } from '@/components/dev/env-checker'
import { ActionAuditTrail } from '@/components/dev/action-audit-trail'

/**
 * Developer Tools hub — one page that gathers the live integration utilities:
 * endpoint tester, JWT decoder, webhook listener, env checker, and the action
 * audit trail. Built for frictionless backend handoff & debugging.
 */
export function DevToolsHub() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-foreground">
          <Wrench className="h-6 w-6 text-primary" />
          أدوات المطورين (Developer Tools)
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          مجموعة أدوات حية لاختبار وتشخيص تكامل الـ API — اختبار المسارات، فك توكن JWT، مراقبة الـ
          Webhooks، فحص البيئة، وتتبع الإجراءات.
        </p>
      </div>

      {/* Endpoint tester spans full width */}
      <EndpointTester />

      {/* Two-column utilities */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AuthTokenDecoder />
        <EnvChecker />
        <WebhookListener />
        <ActionAuditTrail />
      </div>
    </div>
  )
}
