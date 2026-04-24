import { NextRequest, NextResponse } from 'next/server'
import { allowTapRequest, insertTapEvent, getTapRequestIp, type TapEventType } from '@/lib/tap-server'
import { cleanTapValue, normalizeTapSlug } from '@/lib/tap'

const ALLOWED_EVENT_TYPES = new Set<TapEventType>(['visit', 'register', 'store', 'learn'])

function isValidTapPath(path: string | null | undefined): path is string {
  const cleaned = cleanTapValue(path)
  return !!cleaned && cleaned.startsWith('/tap')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
    }

    const rawEventType = body.event_type || body.eventType
    const eventType = typeof rawEventType === 'string' && ALLOWED_EVENT_TYPES.has(rawEventType as TapEventType)
      ? (rawEventType as TapEventType)
      : null
    const path = body.path
    const slug = normalizeTapSlug(typeof body.slug === 'string' ? body.slug : '')

    if (!eventType) {
      return NextResponse.json({ ok: false, error: 'Invalid event type' }, { status: 400 })
    }

    if (!isValidTapPath(path)) {
      return NextResponse.json({ ok: false, error: 'Invalid path' }, { status: 400 })
    }

    const ip = getTapRequestIp(request.headers)
    if (!allowTapRequest('tap-analytics', ip)) {
      return new NextResponse(null, { status: 204 })
    }

    await insertTapEvent({
      eventType,
      path,
      slug: slug || null,
      ref: body.ref ?? null,
      product: body.product ?? null,
      campaign: body.campaign ?? null,
      destinationHref: body.destination_href || body.destinationHref || null,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.warn('[tap] analytics route failed', error)
    return new NextResponse(null, { status: 204 })
  }
}
