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
  // Founding Beta products — demonstrating platform breadth beyond music
  {
    id: 'signal-shirt-001',
    name: 'Signal Shirt',
    price: 35,
    category: 'Brand',
    artist: 'Signal',
    image: '/images/products/signal-shirt-black.png',
    images: ['/images/products/signal-shirt-black.png'],
    description: 'Minimalist signal wave design. Premium cotton. Ships in 3-5 days.',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    fulfillment: 'img_fulfillment',
    available: true,
    inStock: true,
    featured: true,
    artistCut: 28,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'noble-naturals-balm-001',
    name: 'Noble Naturals™ Premium Hair Growth Oil – 1 oz',
    price: 29.99,
    category: 'Wellness & Hair Care',
    artist: 'Noble Naturals',
    image: '/images/products/noble-balm.png',
    images: ['/images/products/noble-balm.png'],
    description: 'Premium hair growth oil from Noble Naturals. Natural ingredients for all hair types.',
    fulfillment: 'img_fulfillment',
    available: true,
    inStock: true,
    featured: true,
    artistCut: 22,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'porterful-sticker-pack-001',
    name: 'Porterful Sticker Pack',
    price: 8,
    category: 'Essential',
    artist: 'Porterful',
    image: '/images/products/porterful-stickers.png',
    images: ['/images/products/porterful-stickers.png'],
    description: '5 vinyl stickers. Weatherproof. Support the platform.',
    fulfillment: 'img_fulfillment',
    available: true,
    inStock: true,
    featured: true,
    artistCut: 6,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  // Noble Naturals preview products — Coming Soon
  {
    id: 'noble-naturals-oil-2oz',
    name: 'The Noble Naturals™ Premium Hair Growth Oil – 2 oz',
    price: 39.99,
    category: 'Wellness & Hair Care',
    artist: 'Noble Naturals',
    image: '/images/products/noble-oil-2oz.png',
    images: ['/images/products/noble-oil-2oz.png'],
    description: 'The premium 2 oz hair growth oil. Larger size, same natural formula. Coming soon to Porterful.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 30,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'noble-naturals-starter-kit',
    name: 'Noble Naturals™ Starter Kit – Grow & Glow Bundle',
    price: 59.99,
    category: 'Wellness & Hair Care',
    artist: 'Noble Naturals',
    image: '/images/products/noble-starter-kit.png',
    images: ['/images/products/noble-starter-kit.png'],
    description: 'The complete Grow & Glow Bundle. Everything you need for your natural hair journey. Coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 45,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'noble-naturals-comb',
    name: 'The Noble Comb – Wooden Edition',
    price: 9.99,
    category: 'Wellness & Hair Care',
    artist: 'Noble Naturals',
    image: '/images/products/noble-comb.png',
    images: ['/images/products/noble-comb.png'],
    description: 'Handcrafted wooden comb designed for natural hair. Gentle on strands and scalp. Coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 7,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.featured && p.offerEligible !== false)
