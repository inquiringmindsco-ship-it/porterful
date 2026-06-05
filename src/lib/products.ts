// Shared product data for the store and product pages

import { CONTROLLED_MERCH } from './controlled-merch'

export interface Collection {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  story: string
  color: string          // accent color (e.g., '#D4A574' for warm gold)
  textColor: string      // text color on accent (e.g., '#1a1a1a')
  badge: string          // badge label
  image?: string
  featured: boolean
}

export interface Brand {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: string
  logo?: string
  featured: boolean
  foundingBrand: boolean
}

export const BRANDS: Brand[] = [
  {
    id: 'noble-naturals',
    slug: 'noble-naturals',
    name: 'Noble Naturals™',
    tagline: 'Wellness & Hair Care',
    description: 'Natural hair care products crafted with premium ingredients for all hair types.',
    category: 'Wellness & Hair Care',
    logo: '/brand/noble-naturals-mark.svg',
    featured: true,
    foundingBrand: true,
  },
  {
    id: 'marvelous-black',
    slug: 'marvelous-black',
    name: 'Marvelous Black™',
    tagline: 'Premium Apparel',
    description: 'Premium apparel designed for those who set the standard.',
    category: 'Apparel',
    logo: '/brand/marvelous-black-mark.svg',
    featured: true,
    foundingBrand: true,
  },
  {
    id: 'coming-home',
    slug: 'coming-home',
    name: 'Coming Home Collection™',
    tagline: 'Resilience & New Beginnings',
    description: 'Products inspired by resilience, rebuilding, second chances, and new beginnings.',
    category: 'Collection',
    logo: '/images/collections/coming-home-badge.svg',
    featured: true,
    foundingBrand: true,
  },
]

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find(b => b.slug === slug)
}

export function getBrandProducts(products: Product[], brandSlug: string): Product[] {
  // Match by artist name or collection
  const brand = getBrandBySlug(brandSlug)
  if (!brand) return []
  
  if (brandSlug === 'coming-home') {
    return products.filter(p => p.collection === 'coming-home')
  }
  
  return products.filter(p => 
    p.artist.toLowerCase().includes(brand.name.toLowerCase().replace('™', '')) ||
    p.category === brand.category
  )
}

export const FOUNDING_BRANDS = BRANDS.filter(b => b.foundingBrand)

export const COMING_HOME_COLLECTION: Collection = {
  id: 'coming-home',
  slug: 'coming-home',
  name: 'Coming Home Collection™',
  tagline: 'Products inspired by resilience, rebuilding, second chances, and new beginnings.',
  description: 'A curated collection of products that represent hope, resilience, and the courage to start again.',
  story: `Everyone has a story. Some stories include setbacks. Others include second chances. The Coming Home Collection is about that moment — when you're ready to rebuild, create, and move forward.

These products represent resilience. They're made for people who believe it's never too late to start again.

In the future, we hope to expand this collection through our Coming Home Creator Program — giving selected creators the opportunity to design products that tell their own stories.

For now, we hope you wear them as a reminder: every day is a new beginning.`,
  color: '#C4956A',       // warm copper/gold
  textColor: '#1a1a1a',
  badge: '🏠 Coming Home™',
  image: '/images/collections/coming-home-banner.svg',
  featured: true,
}

export const PRODUCT_COLLECTIONS: Record<string, Collection> = {
  'coming-home': COMING_HOME_COLLECTION,
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return PRODUCT_COLLECTIONS[slug]
}

export function getCollectionProducts(products: Product[], collectionSlug: string): Product[] {
  return products.filter(p => p.collection === collectionSlug)
}

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
  // Collection support
  collection?: string       // e.g., 'coming-home'
  collectionFeatured?: boolean
  offerEligible?: boolean
  // Fulfillment
  // - "printful" = linked to Printful catalog (works)
  // - "dropship" = third-party supplier (works)
  // - "mock" = placeholder, CANNOT fulfill right now
  fulfillment?: 'printful' | 'dropship' | 'mock' | 'img_fulfillment'
  // available: true only when a real purchase + fulfillment path is confirmed.
  // Anything not explicitly available renders as "Coming Soon" with Buy Now disabled.
  available?: boolean
  publicVisible?: boolean
  storeVisible?: boolean
  purchasable?: boolean
  visibilityStatus?: 'live' | 'preview' | 'unavailable' | 'hidden' | 'controlled'
  // Dropship fields
  dropship?: boolean
  supplier?: string
  supplierPrice?: number
}

export function isPurchasable(product: Pick<Product, 'available' | 'fulfillment'> & { purchasable?: boolean }) {
  if (typeof product.purchasable === 'boolean') {
    return product.purchasable === true
  }

  return product.available === true && product.fulfillment !== 'mock'
}

function dedupeImages(images: string[]) {
  return Array.from(new Set(images.filter(Boolean)))
}

function withGeneratedVariants(image: string) {
  const match = image.match(/^(.+)(\.[a-z0-9]+)$/i)
  if (!match) {
    return [image]
  }

  const [, base, ext] = match
  return [image, `${base}-alt-1${ext}`, `${base}-alt-2${ext}`]
}

export function getProductGallery(product: Pick<Product, 'image' | 'images'>) {
  const images = dedupeImages((product.images || []).filter(Boolean))
  if (images.length > 1) {
    return images
  }

  return dedupeImages(withGeneratedVariants(product.image))
}

export function requiresSizeSelection(product: Pick<Product, 'sizes'>) {
  return Boolean(product.sizes && product.sizes.length > 0)
}

export function getCartLineKey(params: {
  productId: string
  size?: string | null
  color?: string | null
  variantKey?: string | null
}) {
  const explicit = params.variantKey?.trim()
  if (explicit) {
    return explicit
  }

  return [
    params.productId,
    params.size?.trim() || '',
    params.color?.trim() || '',
  ].join('::')
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
    collection: 'coming-home',
    collectionFeatured: true,
  },

  // ==========================================================
  // MOCK / PREVIEW PRODUCTS — DO NOT FULFILL
  // These show as "Coming Soon" on the store.
  // Checkout is blocked by isPurchasable() guard.
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
  // Noble Naturals preview products — Coming Soon
  {
    id: 'noble-naturals-oil-2oz',
    name: 'The Noble Naturals™ Premium Hair Growth Oil – 2 oz',
    price: 39.99,
    category: 'Wellness & Hair Care',
    artist: 'Noble Naturals',
    image: '/images/products/noble-naturals-2oz.png',
    images: ['/images/products/noble-naturals-2oz.png'],
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
    image: '/images/products/noble-naturals-12pack.png',
    images: ['/images/products/noble-naturals-12pack.png'],
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
  // Coming Home Collection™ — Phase 1 Products
  {
    id: 'coming-home-hoodie',
    name: 'Coming Home Hoodie™',
    price: 45,
    category: 'Merch',
    artist: 'ATM Trap',
    image: '/images/products/coming-home-hoodie.png',
    images: ['/images/products/coming-home-hoodie.png'],
    description: 'Premium hoodie featuring the Coming Home Collection™ design. Comfort and resilience in every thread.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
    collection: 'coming-home',
  },
  {
    id: 'coming-home-journal',
    name: 'Coming Home Journal™',
    price: 18,
    category: 'Essential',
    artist: 'Porterful',
    image: '/images/products/coming-home-journal.png',
    images: ['/images/products/coming-home-journal.png'],
    description: 'A journal for new beginnings. Document your journey, one page at a time.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
    collection: 'coming-home',
  },
  {
    id: 'coming-home-poster',
    name: 'Coming Home Poster™',
    price: 25,
    category: 'Art',
    artist: 'Porterful',
    image: '/images/products/coming-home-poster.png',
    images: ['/images/products/coming-home-poster.png'],
    description: 'Inspirational poster art from the Coming Home Collection™. A daily reminder that every day is a new beginning.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
    collection: 'coming-home',
  },
  // Marvelous Black™ — Founding Brand (Preview)
  {
    id: 'marvelous-black-standard-tee',
    name: 'The Standard Tee',
    price: 32,
    category: 'Apparel',
    artist: 'Marvelous Black™',
    image: '/images/products/marvelous-black-standard-tee.png',
    images: ['/images/products/marvelous-black-standard-tee.png'],
    description: 'The Standard Tee by Marvelous Black™. Premium cotton, timeless design. Preview — coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'marvelous-black-standard-hoodie',
    name: 'The Standard Hoodie',
    price: 55,
    category: 'Apparel',
    artist: 'Marvelous Black™',
    image: '/images/products/marvelous-black-standard-hoodie.svg',
    images: ['/images/products/marvelous-black-standard-hoodie.svg'],
    description: 'The Standard Hoodie by Marvelous Black™. Premium weight, clean lines. Preview — coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'marvelous-black-blackline-cap',
    name: 'Blackline Cap',
    price: 28,
    category: 'Apparel',
    artist: 'Marvelous Black™',
    image: '/images/products/marvelous-black-blackline-cap.svg',
    images: ['/images/products/marvelous-black-blackline-cap.svg'],
    description: 'Blackline Cap by Marvelous Black™. Structured, premium build. Preview — coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
  {
    id: 'marvelous-black-centerline-crewneck',
    name: 'Centerline Crewneck',
    price: 48,
    category: 'Apparel',
    artist: 'Marvelous Black™',
    image: '/images/products/marvelous-black-centerline-crewneck.svg',
    images: ['/images/products/marvelous-black-centerline-crewneck.svg'],
    description: 'Centerline Crewneck by Marvelous Black™. Relaxed fit, premium fabric. Preview — coming soon.',
    fulfillment: 'img_fulfillment',
    available: false,
    inStock: false,
    featured: false,
    artistCut: 0,
    sales: 0,
    rating: 0,
    reviews: 0,
  },
]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.featured && p.offerEligible !== false)
