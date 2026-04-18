import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/orders - List user's orders
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (title, image_url, metadata)
        )
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders - Create order (checkout)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping_address, referrer_code } = body

    // Validate items
    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Get products and calculate totals
    const productIds = items.map((item: any) => item.product_id)
    const { data: products } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    if (!products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'Invalid products' }, { status: 400 })
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.product_id)
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      return {
        product_id: product.id,
        product_name: product.title,
        quantity: item.quantity,
        price: product.price,
        seller_id: product.seller_id,
        artist_id: product.linked_artist_id,
      }
    })

    // Calculate revenue splits
    const sellerTotal = subtotal * 0.67
    const artistFundTotal = subtotal * 0.20
    const superfanTotal = subtotal * 0.03
    const platformTotal = subtotal * 0.10

    // Get referrer if provided
    let referrerId = null
    if (referrer_code) {
      const { data: referrer } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referrer_code)
        .single()
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        subtotal,
        total: subtotal,
        referrer_id: referrerId,
        shipping_address: shipping_address,
        status: 'pending',
      })
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems.map((item: any) => ({
        ...item,
        order_id: order.id,
      })))

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // TODO: Create Stripe checkout session
    // TODO: Create dropship order if applicable

    return NextResponse.json({ 
      order,
      checkout_url: `/checkout/${order.id}` // Placeholder for Stripe
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}