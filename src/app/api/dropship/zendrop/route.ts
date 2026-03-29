// Zendrop API integration for dropshipping
import { NextRequest, NextResponse } from 'next/server'

const ZENDROP_API_URL = 'https://api.zendrop.com/v1'

async function zendropRequest(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.ZENDROP_API_KEY
  
  if (!apiKey || apiKey === 'your_zendrop_api_key') {
    return null
  }

  const response = await fetch(`${ZENDROP_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  return response.json()
}

// GET /api/dropship/zendrop/products - List Zendrop products
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ZENDROP_API_KEY
    
    if (!apiKey || apiKey === 'your_zendrop_api_key') {
      return NextResponse.json({ 
        error: 'Zendrop not configured',
        demo: true,
        message: 'Add ZENDROP_API_KEY to your environment to enable dropshipping.',
        products: []
      })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'products') {
      const data = await zendropRequest('/products')
      return NextResponse.json(data)
    }

    if (action === 'search') {
      const query = searchParams.get('q')
      const data = await zendropRequest(`/products/search?q=${encodeURIComponent(query || '')}`)
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Zendrop API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/dropship/zendrop - Create order
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ZENDROP_API_KEY
    const body = await request.json()
    const { action, data } = body

    if (!apiKey || apiKey === 'your_zendrop_api_key') {
      // Demo mode
      return NextResponse.json({
        success: true,
        demo: true,
        orderId: `z-demo-${Date.now()}`,
        message: 'Zendrop not configured - order simulated'
      })
    }

    if (action === 'create_order') {
      const orderData = {
        external_id: data.orderId,
        shipping_address: {
          name: data.shipping.name,
          address1: data.shipping.address,
          city: data.shipping.city,
          state: data.shipping.state,
          zip: data.shipping.zip,
          country: data.shipping.country,
        },
        items: data.items.map((item: any) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
      }

      const result = await zendropRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })

      return NextResponse.json(result)
    }

    if (action === 'shipping_rates') {
      const result = await zendropRequest('/shipping/rates', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Zendrop API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}