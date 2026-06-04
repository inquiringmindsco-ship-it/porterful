import { PRODUCTS } from './products'

export const CONTROLLED_MERCH = {
  productId: '75006c54-3f40-4309-81a1-a85de8f34841',
  skuId: 'eb4a802e-e00a-42cf-8e01-ea8ac8a7e773',
  skuCode: 'COMING-HOME-TEE-001',
  productionAssetId: '241d0c66-c1aa-4c36-ae33-bad98f31c34a',
  artistId: 'd1a19160-732f-44c4-8040-9cc20fcb9e05',
  artistName: 'ATM Trap',
  artistHandle: 'atm-trap',
  productTitle: 'Coming Home Tee',
  productCategory: 'Merch',
  productType: 'shirt',
  productColor: 'Black',
  productSize: 'L',
  retailPriceCents: 3000,
  retailPriceDollars: 30,
  unitCostCents: 750,
  fulfillmentType: 'img_fulfillment',
  catalogStatus: 'controlled_test',
  image: '/images/products/coming-home-tee-black.png',
  images: [
    '/images/products/coming-home-tee-black.png',
  ],
  description: 'Controlled IMG Fulfillment test product linked to the Coming Home asset.',
} as const

// Additional Founding Beta products to show platform breadth
export const FOUNDING_BETA_PRODUCTS = {
  // Signal Shirt — Brand product (non-music)
  signalShirt: {
    id: 'signal-shirt-001',
    name: 'Signal Shirt',
    price: 35,
    category: 'Brand',
    artist: 'Signal',
    image: '/images/products/signal-shirt-black.png',
    colors: ['Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Minimalist signal wave design. Premium cotton.',
    available: true,
    fulfillment: 'img_fulfillment',
    featured: true,
  },
  
  // Noble Naturals — Wellness brand product
  nobleNaturalsBalm: {
    id: 'noble-naturals-balm-001',
    name: 'Noble Naturals Healing Balm',
    price: 18,
    category: 'Wellness',
    artist: 'Noble Naturals',
    image: '/images/products/noble-balm.png',
    description: 'All-natural healing balm. Handmade in small batches.',
    available: true,
    fulfillment: 'img_fulfillment',
    featured: true,
  },
  
  // Porterful Essential — Platform branded
  porterfulStickerPack: {
    id: 'porterful-sticker-pack-001',
    name: 'Porterful Sticker Pack',
    price: 8,
    category: 'Essential',
    artist: 'Porterful',
    image: '/images/products/porterful-stickers.png',
    description: '5 vinyl stickers. Weatherproof. Support the platform.',
    available: true,
    fulfillment: 'img_fulfillment',
    featured: true,
  },
} as const

export function getFoundingBetaProducts() {
  // Products now added directly to PRODUCTS array in products.ts
  return []
}

export function addFoundingBetaProducts() {
  // Products now added directly to PRODUCTS array in products.ts
  // This function kept for backward compatibility
}

export function isControlledMerchProductId(value?: string | null) {
  return value === CONTROLLED_MERCH.productId
}

export function isControlledMerchSkuCode(value?: string | null) {
  return value === CONTROLLED_MERCH.skuCode
}
