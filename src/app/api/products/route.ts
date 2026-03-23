import { NextRequest, NextResponse } from 'next/server'
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
    categories: [...new Set(products.map(p => p.category))],
    subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))]
  })
}

// GET /api/products/[id] - Get single product
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body
  
  const product = ALL_PRODUCTS.find(p => p.id === id)
  
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    ...product,
    salePrice: Math.round((product.basePrice || 5) * 1.3 * 100) / 100,
  })
}