import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ALL_PRODUCTS } from '@/lib/products'

// Artist margin based on tier
const ARTIST_MARGINS = {
  'new': 0.60,
  'growing': 0.70,
  'established': 0.80
}

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '200')
  
  let products = [...ALL_PRODUCTS]
  
  // Filter by category
  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }
  
  // Filter by subcategory
  if (subcategory) {
    products = products.filter(p => p.subcategory?.toLowerCase() === subcategory.toLowerCase())
  }
  
  // Search
  if (search) {
    const searchLower = search.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.subcategory?.toLowerCase().includes(searchLower)
    )
  }
  
  // Calculate sale price (30% markup default)
  products = products.map(p => ({
    ...p,
    salePrice: Math.round((p.basePrice || 5) * 1.3 * 100) / 100,
  }))
  
  return NextResponse.json({
    products: products.slice(0, limit),
    total: products.length,
    categories: Array.from(new Set(products.map(p => p.category))),
    subcategories: Array.from(new Set(products.map(p => p.subcategory).filter(Boolean)))
  })
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
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
    
    // Get current user
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { 
      name, description, category, price, cost = 0, images = [], 
      variants = [], dropship_provider = 'none', dropship_product_id = ''
    } = body
    
    // Validate required fields
    if (!name || !category || !price) {
      return NextResponse.json({ 
        error: 'Missing required fields: name, category, price' 
      }, { status: 400 })
    }
    
    // Create product in database - matching schema fields
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        description,
        category,
        price,
        cost,
        images,
        variants,
        printful_product_id: dropship_product_id,
        stock: 999,
        seller_id: session.user.id,
        is_active: true,
        commission_rate: 0.10,
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