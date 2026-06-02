// Shared product data for the store and product pages

import { CONTROLLED_MERCH } from './controlled-merch'

export interface Product {
  id: string
  name: string
  price: number
  category: string
  artist: string
  image: string
  images?: string[]
  description?: string
  featured?: boolean
  colors?: string[]
  sizes?: string[]
  format?: string
  tracks?: number
  inStock?: boolean
  artistCut?: number
  sales?: number
  rating?: number
  reviews?: number
  // Controlled merch / registry metadata
  skuId?: string
  skuCode?: string
  productionAssetId?: string
  artistId?: string
  fulfillmentType?: 'printful' | 'dropship' | 'mock' | 'img_fulfillment'
  catalogStatus?: string
  offerEligible?: boolean
  // Fulfillment
  // - "printful" = linked to Printful catalog (works)
  // - "dropship" = third-party supplier (works)
  // - "mock" = placeholder, CANNOT fulfill right now
  fulfillment?: 'printful' | 'dropship' | 'mock' | 'img_fulfillment'
  // available: true only when a real purchase + fulfillment path is confirmed.
  // Anything not explicitly available renders as "Coming Soon" with Buy Now disabled.
  available?: boolean
  // Dropship fields
  dropship?: boolean
  supplier?: string
  supplierPrice?: number
}

export function isPurchasable(product: Pick<Product, 'available' | 'fulfillment'>) {
  return product.available === true && product.fulfillment !== 'mock'
}

export const PRODUCTS: Product[] = [
  // ==========================================================
  // ACTIVE / FULFILLABLE PRODUCTS
  // Requirements to move a product here:
  //   - Printful product ID configured OR dropship supplier linked
  //   - Stripe price ID confirmed working
  //   - Test order successfully placed
  // ==========================================================
  // (None yet — Printful API key not configured)

  {
    id: CONTROLLED_MERCH.productId,
    name: CONTROLLED_MERCH.productTitle,
    price: CONTROLLED_MERCH.retailPriceDollars,
    category: CONTROLLED_MERCH.productCategory,
    artist: CONTROLLED_MERCH.artistName,
    image: CONTROLLED_MERCH.image,
    images: [CONTROLLED_MERCH.image],
    featured: false,
    description: CONTROLLED_MERCH.description,
    colors: [CONTROLLED_MERCH.productColor],
    sizes: [CONTROLLED_MERCH.productSize],
    fulfillment: CONTROLLED_MERCH.fulfillmentType,
    fulfillmentType: CONTROLLED_MERCH.fulfillmentType,
    catalogStatus: CONTROLLED_MERCH.catalogStatus,
    skuId: CONTROLLED_MERCH.skuId,
    skuCode: CONTROLLED_MERCH.skuCode,
    productionAssetId: CONTROLLED_MERCH.productionAssetId,
    artistId: CONTROLLED_MERCH.artistId,
    offerEligible: false,
    available: true,
    inStock: true,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },

  // ==========================================================
  // MOCK / PLACEHOLDER PRODUCTS — DO NOT FULFILL
  // These show as "Coming Soon" on the store.
  // Checkout is blocked by isPurchasable() guard.
  //
  // To activate a product:
  //   1. Set fulfillment: 'printful' or 'dropship'
  //   2. Set available: true
  //   3. Add real Printful/dropship product IDs
  //   4. Test checkout end-to-end
  // ==========================================================

  {
    id: 'signal-shirt',
    name: 'LIKENESS Signal Shirt',
    price: 65,
    category: 'Signal',
    artist: 'Likeness™',
    image: '/signal/black-front.png',
    images: [
      '/signal/black-front.png',
      '/signal/black-side.png',
      '/signal/black-back.png',
      '/signal/white-front.png',
      '/signal/white-side.png',
      '/signal/white-back.png',
      '/signal/origin-front.png',
      '/signal/origin-side.png',
      '/signal/origin-back.png',
    ],
    featured: true,
    description: 'Preview concept. Not live yet.',
    colors: ['Black', 'White', 'Origin'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fulfillment: 'mock', // Images are placeholders, no Printful link
    available: false,
    inStock: true,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: '75006c54-3f40-4309-81a1-a85de8f34841',
    name: 'Coming Home Tee',
    price: 30,
    category: 'Merch',
    artist: 'ATM Trap',
    image: '/brand/porterful/porterful_official_p_recolorable_mask_black.png',
    featured: true,
    description: 'Limited tee from ATM Trap. Controlled merch activation.',
    colors: ['Black'],
    sizes: ['L'],
    fulfillment: 'img_fulfillment',
    available: true,
    inStock: true,
    artistCut: 24,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'gune-shirt',
    name: 'Gune Classic Tee',
    price: 40,
    category: 'Merch',
    artist: 'Gune',
    image: '/artist-images/gune/gune-shirt.jpg',
    featured: true,
    description: 'Preview merch. Not live yet.',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    fulfillment: 'mock',
    available: false,
    inStock: true,
    artistCut: 32,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.featured && p.offerEligible !== false)
