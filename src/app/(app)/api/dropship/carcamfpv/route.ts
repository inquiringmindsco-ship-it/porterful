// CarcamFPV Dropship API integration
// Forward orders to CarcamFPV when customers purchase RC FPV Mini Car from Porterful
import { NextRequest, NextResponse } from 'next/server'

const CARCAMFPV_API_URL = process.env.CARCAMFPV_API_URL || ''
const CARCAMFPV_API_KEY = process.env.CARCAMFPV_API_KEY || ''

interface DropshipItem {
  name: string
  quantity: number
  price: number
  sku?: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
  email?: string
}

interface DropshipPayload {
  orderId: string
  customer: {
    email: string
    name: string
    phone?: string
  }
  shippingAddress: ShippingAddress
  items: DropshipItem[]
  total: number
  shippingCost: number
  PorterfulMargin: number
}

// Forward order to CarcamFPV
async function forwardToCarcamFPV(payload: DropshipPayload) {
  if (!CARCAMFPV_API_URL || !CARCAMFPV_API_KEY) {
    return { success: false, demo: true, message: 'CarcamFPV not configured — set CARCAMFPV_API_URL and CARCAMFPV_API_KEY in environment' }
  }

  try {
    const response = await fetch(`${CARCAMFPV_API_URL}/api/dropship/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CARCAMFPV_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_order_id: payload.orderId,
        recipient: {
          name: `${payload.shippingAddress.firstName} ${payload.shippingAddress.lastName}`,
          email: payload.customer.email,
          phone: payload.customer.phone || payload.shippingAddress.phone || '',
          address1: payload.shippingAddress.address,
          city: payload.shippingAddress.city,
          state: payload.shippingAddress.state,
          zip: payload.shippingAddress.zip,
          country: payload.shippingAddress.country,
        },
        items: payload.items.map(item => ({
          sku: item.sku || 'rc-fpv-mini-car',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shipping_method: 'standard',
        notes: `Porterful dropship order. Margin: $${payload.PorterfulMargin.toFixed(2)}`,
      }),
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// GET /api/dropship/carcamfpv - Check connection status
export async function GET() {
  const configured = !!(CARCAMFPV_API_URL && CARCAMFPV_API_KEY)
  return NextResponse.json({
    status: configured ? 'configured' : 'not_configured',
    message: configured
      ? 'CarcamFPV dropship integration is active'
      : 'Add CARCAMFPV_API_URL and CARCAMFPV_API_KEY to enable automatic order forwarding',
    product: {
      id: 'rc-fpv-mini-car',
      name: 'RC FPV Mini Car',
      supplierPrice: 44.95,
      storePrice: 59.95,
      margin: 15.00,
    },
  })
}

// POST /api/dropship/carcamfpv - Forward a paid order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body

    if (action === 'forward_order') {
      const result = await forwardToCarcamFPV(payload)

      if (result.demo) {
        // Log demo mode
        console.log('[carcamfpv-dropship] Demo mode — order would be forwarded:', payload.orderId)
        return NextResponse.json({
          success: true,
          demo: true,
          orderId: payload.orderId,
          message: 'Demo: order logged. Configure CARCAMFPV_API_URL + CARCAMFPV_API_KEY to enable live forwarding.',
          margin: payload.PorterfulMargin,
          forwarding: result,
        })
      }

      return NextResponse.json({
        success: result.success,
        orderId: payload.orderId,
        supplierResponse: result.data,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use: forward_order' }, { status: 400 })
  } catch (error: any) {
    console.error('[carcamfpv-dropship] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
