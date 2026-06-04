import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { verifyAdminAccess } from '@/lib/admin-client'
import { createServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type OrderRow = {
  id: string
  amount: number | null
  status: string | null
  buyer_email: string | null
  stripe_checkout_session_id: string | null
  created_at: string
  payment_method: string | null
  buyer_id: string | null
  user_id: string | null
}

type MusicPurchaseRow = {
  id: string
  buyer_email: string | null
  track_title: string | null
  artist_name: string | null
  stripe_session_id: string | null
  amount_paid: number | null
  purchased_at: string | null
  created_at: string | null
  download_count: number | null
  last_downloaded_at: string | null
  recovery_token: string | null
  recovery_token_expires_at: string | null
  buyer_user_id: string | null
}

type ReconciledTransaction = {
  id: string
  source: string
  stripe_session_id: string | null
  buyer_email: string | null
  buyer_user_id: string | null
  amount_cents: number
  amount_dollars: string
  status: string
  payment_method: string
  created_at: string
  track_title?: string
  artist_name?: string
  order_id?: string | null
  purchase_id?: string | null
  download_count: number
  last_downloaded_at: string | null
  recovery_token: string | null
  recovery_token_expires_at: string | null
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

function normalizeEmail(value: string | null | undefined): string | null {
  const email = value?.trim().toLowerCase() || ''
  return email || null
}

function normalizeAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value)
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return Math.round(parsed)
  }
  return 0
}

function stringifyFromLineItem(session: any): { trackTitle: string; artistName: string } {
  const metadata = session?.metadata || {}
  const lineItem = session?.line_items?.data?.[0]

  const trackTitle =
    metadata.track_name ||
    metadata.product_name ||
    lineItem?.description ||
    metadata.product_id ||
    'Purchase'

  const artistName =
    metadata.track_artist ||
    metadata.artist ||
    metadata.username ||
    'Porterful'

  return { trackTitle, artistName }
}

export async function GET(request: NextRequest) {
  try {
    // Use centralized admin verification (cookie-based, more reliable)
    const auth = await verifyAdminAccess(request)
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error || 'Forbidden: founder or admin required' },
        { status: 403 }
      )
    }

    const supabase = createServerClient()

    const [ordersResult, purchasesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('id, amount, status, buyer_email, buyer_id, user_id, stripe_checkout_session_id, created_at, payment_method')
        .not('stripe_checkout_session_id', 'is', null)
        .order('created_at', { ascending: true }),
      supabase
        .from('music_purchases')
        .select('id, buyer_email, buyer_user_id, track_title, artist_name, stripe_session_id, amount_paid, purchased_at, created_at, download_count, last_downloaded_at, recovery_token, recovery_token_expires_at')
        .not('stripe_session_id', 'is', null)
        .order('created_at', { ascending: true }),
    ])

    if (ordersResult.error) {
      return NextResponse.json(
        { error: `Failed to fetch orders: ${ordersResult.error.message}` },
        { status: 500 }
      )
    }

    if (purchasesResult.error) {
      return NextResponse.json(
        { error: `Failed to fetch music purchases: ${purchasesResult.error.message}` },
        { status: 500 }
      )
    }

    const orders = (ordersResult.data || []) as OrderRow[]
    const purchases = (purchasesResult.data || []) as MusicPurchaseRow[]
    const orderBySession = new Map(orders.map((order) => [order.stripe_checkout_session_id, order]))
    const purchaseBySession = new Map(purchases.map((purchase) => [purchase.stripe_session_id, purchase]))

    const dbSessionIds = new Set<string>([
      ...orders.map((order) => order.stripe_checkout_session_id).filter((id): id is string => Boolean(id)),
      ...purchases.map((purchase) => purchase.stripe_session_id).filter((id): id is string => Boolean(id)),
    ])

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const stripeSessions: any[] = []
    let startingAfter: string | undefined

    for (let page = 0; page < 5; page += 1) {
      const pageResult = await stripe.checkout.sessions.list({ limit: 100, ...(startingAfter ? { starting_after: startingAfter } : {}) })
      const filtered = pageResult.data.filter((session) => {
        const source = session.metadata?.source
        return session.payment_status === 'paid' && (source === 'porterful' || source === 'likeness')
      })
      stripeSessions.push(...filtered)
      if (!pageResult.has_more || pageResult.data.length === 0) break
      startingAfter = pageResult.data[pageResult.data.length - 1]?.id
    }

    const stripeSessionIds = new Set<string>(stripeSessions.map((session) => session.id))
    const allSessionIds = new Set<string>([...Array.from(dbSessionIds), ...Array.from(stripeSessionIds)])
    const sessionIds = Array.from(allSessionIds)

    const sessionDetails = await Promise.allSettled(
      sessionIds.map((sessionId) =>
        stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['customer_details', 'line_items'],
        })
      )
    )

    const warnings: string[] = []
    const transactions: ReconciledTransaction[] = []

    sessionDetails.forEach((result, index) => {
      const sessionId = sessionIds[index]
      const order = orderBySession.get(sessionId)
      const purchase = purchaseBySession.get(sessionId)

      if (result.status !== 'fulfilled') {
        warnings.push(`Stripe session ${sessionId} could not be retrieved: ${result.reason?.message || 'unknown error'}`)
      }

      const session = result.status === 'fulfilled' ? result.value : null
      const metadata = session?.metadata || {}
      const amountPaid = normalizeAmount(session?.amount_total ?? order?.amount ?? purchase?.amount_paid)
      const buyerEmail = normalizeEmail(
        session?.customer_details?.email ||
          session?.customer_email ||
          order?.buyer_email ||
          purchase?.buyer_email ||
          metadata.email ||
          null
      )
      const { trackTitle, artistName } = stringifyFromLineItem(session)
      const source =
        order ? 'orders' : purchase ? 'music_purchases' : 'stripe_only'

      const purchasedAt =
        purchase?.purchased_at ||
        purchase?.created_at ||
        order?.created_at ||
        (session?.created ? new Date(session.created * 1000).toISOString() : new Date().toISOString())

      const downloadCount = purchase?.download_count ?? 0
      const tokenExpiresAt = purchase?.recovery_token_expires_at || null
      transactions.push({
        id: sessionId,
        stripe_session_id: sessionId,
        source,
        buyer_email: buyerEmail,
        buyer_user_id: purchase?.buyer_user_id || order?.buyer_id || order?.user_id || null,
        amount_cents: amountPaid,
        amount_dollars: (amountPaid / 100).toFixed(2),
        status: 'completed',
        payment_method: order?.payment_method || 'stripe',
        created_at: purchasedAt,
        track_title: purchase?.track_title || trackTitle,
        artist_name: purchase?.artist_name || artistName,
        order_id: order?.id || null,
        purchase_id: purchase?.id || null,
        download_count: downloadCount,
        last_downloaded_at: purchase?.last_downloaded_at || null,
        recovery_token: purchase?.recovery_token || null,
        recovery_token_expires_at: tokenExpiresAt,
      })
    })

    transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const revenueCents = transactions.reduce((sum, row) => sum + row.amount_cents, 0)
    const uniqueBuyers = new Set(transactions.map((row) => row.buyer_email).filter((email): email is string => Boolean(email))).size
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const revenueToday = transactions
      .filter((row) => new Date(row.created_at) >= todayStart)
      .reduce((sum, row) => sum + row.amount_cents, 0)
    const revenueWeek = transactions
      .filter((row) => new Date(row.created_at) >= weekStart)
      .reduce((sum, row) => sum + row.amount_cents, 0)
    const downloadedCount = transactions.filter((row) => (row.download_count || 0) > 0).length

    return NextResponse.json({
      source: 'stripe-reconciled',
      canonical_finance_ledger: 'orders',
      canonical_access_ledger: 'music_purchases',
      totals: {
        transactions_count: transactions.length,
        matched_orders: transactions.filter((row) => Boolean(row.order_id)).length,
        matched_purchases: transactions.filter((row) => Boolean(row.purchase_id)).length,
        revenue_cents: revenueCents,
        unique_buyers: uniqueBuyers,
        missing_orders: transactions.filter((row) => !row.order_id && Boolean(row.purchase_id)).length,
        missing_purchases: transactions.filter((row) => Boolean(row.order_id) && !row.purchase_id).length,
      },
      metrics: {
        total_revenue_dollars: (revenueCents / 100).toFixed(2),
        total_transactions: transactions.length,
        total_orders: transactions.filter((row) => row.source === 'orders').length,
        total_music_purchases: transactions.filter((row) => row.source === 'music_purchases').length,
        unique_buyers: uniqueBuyers,
        downloaded_count: downloadedCount,
        revenue_today_dollars: (revenueToday / 100).toFixed(2),
        revenue_week_dollars: (revenueWeek / 100).toFixed(2),
      },
      transactions,
      warnings,
    })
  } catch (error: any) {
    console.error('[api/dashboard/revenue] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
