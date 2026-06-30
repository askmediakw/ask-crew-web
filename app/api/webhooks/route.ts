import { type NextRequest, NextResponse } from 'next/server'

// Generic inbound webhook receiver (Stripe / Tap / KNET / DRM provider, etc.).
// TODO(api-keys): verify the provider signature header against the relevant
// signing secret, then dispatch on event type to the appropriate handler.
export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get('provider') ?? 'unknown'
  let payload: unknown = null
  try {
    payload = await req.json()
  } catch {
    // Some providers send form-encoded or raw bodies; ignore parse failures in the stub.
  }

  // TODO(db): persist the event and process it idempotently using its event id.
  const eventType =
    payload && typeof payload === 'object' && 'type' in payload
      ? String((payload as { type: unknown }).type)
      : 'mock.event'

  return NextResponse.json({
    received: true,
    provider,
    eventType,
    mock: true,
    processedAt: new Date().toISOString(),
  })
}

// Some providers ping the endpoint with GET to validate it exists.
export async function GET() {
  return NextResponse.json({ status: 'ok', mock: true })
}
