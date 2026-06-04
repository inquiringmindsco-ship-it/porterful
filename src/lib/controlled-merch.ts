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

export function isControlledMerchProductId(value?: string | null) {
  return value === CONTROLLED_MERCH.productId
}

export function isControlledMerchSkuCode(value?: string | null) {
  return value === CONTROLLED_MERCH.skuCode
}
