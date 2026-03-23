// Printful API Integration
import { NextRequest, NextResponse } from 'next/server'

const PRINTFUL_API = 'https://api.printful.com'

// Printful product catalog for artists
export const PRINTFUL_PRODUCTS = [
  // Apparel
  { id: 'tshirt-standard', name: 'Premium Cotton Tee', type: 'apparel', basePrice: 8.50, printfulId: 71, image: '/products/tshirt.jpg' },
  { id: 'hoodie-premium', name: 'Premium Hoodie', type: 'apparel', basePrice: 22.00, printfulId: 156, image: '/products/hoodie.jpg' },
  { id: 'longsleeve', name: 'Long Sleeve Tee', type: 'apparel', basePrice: 12.00, printfulId: 11, image: '/products/longsleeve.jpg' },
  { id: 'tank-top', name: 'Tank Top', type: 'apparel', basePrice: 9.00, printfulId: 139, image: '/products/tank.jpg' },
  { id: 'zip-hoodie', name: 'Zip Hoodie', type: 'apparel', basePrice: 26.00, printfulId: 179, image: '/products/ziphoodie.jpg' },
  
  // Music
  { id: 'vinyl-12', name: '12" Vinyl Record', type: 'music', basePrice: 12.00, printfulId: null, image: '/products/vinyl.jpg' },
  { id: 'cd-jewel', name: 'CD Jewel Case', type: 'music', basePrice: 2.50, printfulId: null, image: '/products/cd.jpg' },
  
  // Accessories
  { id: 'cap-snapback', name: 'Snapback Cap', type: 'accessory', basePrice: 7.00, printfulId: 15, image: '/products/cap.jpg' },
  { id: 'beanie', name: 'Premium Beanie', type: 'accessory', basePrice: 6.50, printfulId: 31, image: '/products/beanie.jpg' },
  { id: 'tote-bag', name: 'Canvas Tote', type: 'accessory', basePrice: 5.00, printfulId: 18, image: '/products/tote.jpg' },
  { id: 'poster-18x24', name: '18x24 Poster', type: 'accessory', basePrice: 4.00, printfulId: 69, image: '/products/poster.jpg' },
  { id: 'mug-11oz', name: '11oz Mug', type: 'accessory', basePrice: 4.50, printfulId: 14, image: '/products/mug.jpg' },
  
  // Phone Cases
  { id: 'phone-case', name: 'Phone Case', type: 'accessory', basePrice: 6.00, printfulId: 159, image: '/products/phonecase.jpg' },
]

// Artist pricing tiers (margin they keep)
export const ARTIST_MARGINS = {
  'new': 0.60,        // New artists: 60% of profit
  'growing': 0.70,    // Growing: 70% of profit  
  'established': 0.80 // Established: 80% of profit
}

// Calculate artist earnings
export function calculateArtistEarnings(basePrice: number, salePrice: number, tier: keyof typeof ARTIST_MARGINS = 'new'): number {
  const profit = salePrice - basePrice
  const margin = ARTIST_MARGINS[tier]
  return Math.round(profit * margin * 100) / 100
}

// Get Printful client
function getPrintfulClient() {
  const apiKey = process.env.PRINTFUL_API_KEY
  if (!apiKey || apiKey === 'your_printful_api_key') {
    return null
  }
  
  return {
    async request(endpoint: string, options: RequestInit = {}) {
      const response = await fetch(`${PRINTFUL_API}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
      return response.json()
    }
  }
}

// GET /api/dropship/printful/products - List Printful products
export async function GET(request: NextRequest) {
  try {
    const client = getPrintfulClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    if (!client) {
      // Return local product catalog
      return NextResponse.json({
        products: PRINTFUL_PRODUCTS,
        demo: true,
        message: 'Printful not configured. Showing product catalog.',
      })
    }
    
    if (action === 'products') {
      // Get all products from Printful store
      const data = await client.request('/store/products')
      return NextResponse.json(data)
    }
    
    if (action === 'product') {
      const productId = searchParams.get('id')
      const data = await client.request(`/store/products/${productId}`)
      return NextResponse.json(data)
    }
    
    if (action === 'catalog') {
      // Return our curated product list
      return NextResponse.json({
        products: PRINTFUL_PRODUCTS,
        artistMargins: ARTIST_MARGINS,
      })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error: any) {
    console.error('Printful API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/dropship/printful - Create order
export async function POST(request: NextRequest) {
  try {
    const client = getPrintfulClient()
    const body = await request.json()
    const { action, data } = body
    
    if (!client) {
      return NextResponse.json({
        success: false,
        demo: true,
        message: 'Printful not configured. Order saved locally.',
      })
    }
    
    if (action === 'create_order') {
      // Create order in Printful
      const orderData = {
        external_id: data.orderId,
        recipient: {
          name: `${data.shipping.firstName} ${data.shipping.lastName}`,
          address1: data.shipping.address,
          city: data.shipping.city,
          state_code: data.shipping.state,
          country_code: data.shipping.country || 'US',
          zip: data.shipping.zip,
          email: data.email,
          phone: data.shipping.phone,
        },
        items: data.items.map((item: any) => ({
          external_id: item.id,
          variant_id: item.printfulVariantId,
          quantity: item.quantity,
          files: [{ url: item.designUrl }],
        })),
        retail_costs: {
          currency: 'USD',
          subtotal: data.subtotal,
          shipping: data.shippingCost,
          tax: data.tax || 0,
        },
      }
      
      const result = await client.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      })
      
      return NextResponse.json(result)
    }
    
    if (action === 'shipping_rates') {
      // Get shipping rates
      const result = await client.request('/shipping/rates', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      
      return NextResponse.json(result)
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    
  } catch (error: any) {
    console.error('Printful order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}