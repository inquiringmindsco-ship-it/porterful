import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServerClient as createAdminClient } from '@/lib/supabase'
import { PRODUCTS } from '@/lib/products'

async function getSessionUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

const LIVE_PRODUCT_LIMIT = 3

// GET /api/products - List all products
// Query params: category, search, mine (1=current user only), limit
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const mine = searchParams.get('mine') === '1'
  const limit = parseInt(searchParams.get('limit') || '200')

  // If mine=1, fetch from Supabase with auth
  if (mine) {
    try {
      const user = await getSessionUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const supabase = createAdminClient()

      const query = supabase
        .from('products')
        .select('id, title, description, category, base_price, price, image_url, metadata, status, printful_product_id, printful_sync_status, seller_id, seller_type, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Products fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        products: data || [],
        total: data?.length || 0,
      })
    } catch (err) {
      console.error('Products GET error:', err)
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
    }
  }

  // Public: use static PRODUCTS, filtered
  let products = [...PRODUCTS]

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }

  if (search) {
    const searchLower = search.toLowerCase()
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.artist?.toLowerCase().includes(searchLower)
    )
  }

  products = products.map(p => ({
    ...p,
    salePrice: Math.round((p.price || 5) * 1.3 * 100) / 100,
  }))

  return NextResponse.json({
    products: products.slice(0, limit),
    total: products.length,
    categories: Array.from(new Set(products.map(p => p.category))),
  })
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createAdminClient()

    const { count: liveProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .eq('status', 'live')

    if ((liveProductsCount || 0) >= LIVE_PRODUCT_LIMIT) {
      return NextResponse.json({
        error: `You have reached the live product limit (${LIVE_PRODUCT_LIMIT}). Archive a product before publishing a new one.`,
        code: 'LIVE_PRODUCT_LIMIT_REACHED',
      }, { status: 400 })
    }

    const body = await request.json()
    const {
      title,
      name,
      description,
      category,
      price,
      image_url = null,
      metadata = null,
      images = [],
      variants = [],
      printful_product_id = null,
      status = 'draft',
    } = body

    const productTitle = (typeof title === 'string' ? title : name || '').trim()
    const numericPrice = Number(price)
    const coverImageUrl = image_url || images[0] || null

    if (!productTitle || !category || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ error: 'Missing required fields: title, category, price' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        title: productTitle,
        description: description || null,
        category,
        base_price: numericPrice,
        price: Math.round(numericPrice),
        image_url: coverImageUrl,
        metadata: images.length > 0 ? { images } : null,
        variants,
        printful_product_id,
        printful_sync_status: printful_product_id ? 'pending' : 'not_linked',
        inventory_count: 999,
        seller_id: user.id,
        seller_type: 'artist',
        status,
      })
      .select()
      .single()

    if (error) {
      console.error('Product insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: data })
  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
