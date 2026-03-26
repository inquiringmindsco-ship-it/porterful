import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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
    // Get auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      // Check for cookie-based auth
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      // Get user from cookie
      const body = await request.json()
      
      // Validate required fields
      if (!body.name || !body.price) {
        return NextResponse.json({ error: 'Name and price are required' }, { status: 400 })
      }
      
      // For now, store in-memory (demo mode)
      // In production, this would insert into Supabase
      const newProduct = {
        id: `product_${Date.now()}`,
        name: body.name,
        description: body.description || '',
        category: body.category || 'artist_merch',
        subcategory: body.subcategory,
        price: parseFloat(body.price),
        cost: parseFloat(body.cost) || 0,
        images: body.images || [],
        variants: body.variants || [],
        inventory_count: parseInt(body.inventory_count) || 999,
        dropship_provider: body.dropship_provider || 'none',
        dropship_product_id: body.dropship_product_id,
        linked_artist_id: body.linked_artist_id,
        inStock: true,
        createdAt: new Date().toISOString(),
      }
      
      console.log('Created product:', newProduct)
      
      // In production: insert into Supabase
      // const { data, error } = await supabase
      //   .from('products')
      //   .insert(newProduct)
      //   .select()
      //   .single()
      
      // if (error) {
      //   return NextResponse.json({ error: error.message }, { status: 500 })
      // }
      
      return NextResponse.json({ 
        success: true, 
        product: newProduct,
        message: 'Product created successfully! Note: In demo mode, products are stored temporarily.'
      })
    }
    
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
  } catch (error: any) {
    console.error('Product creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}