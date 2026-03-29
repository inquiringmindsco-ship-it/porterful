// Porterful Product Catalog - Curated for Artists
// Using real product images from Unsplash

const getProductImage = (category: string, subcategory: string, index: number): string => {
  // Real product images based on category
  const images: Record<string, string> = {
    'Apparel': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    'Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    'Home & Living': 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
    'Art': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
    'Music': 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500',
  }
  return images[category] || images['Apparel']
}

export const PRINTFUL_CATALOG = {
  // T-SHIRTS
  tshirts: [
    { id: 'odp-tee-classic-black', name: 'Classic Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 28.00, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500' },
    { id: 'odp-tee-vintage-black', name: 'Vintage Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 32.00, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500' },
    { id: 'odp-tee-premium-black', name: 'Premium Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 35.00, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500' },
  ],

  // HOODIES
  hoodies: [
    { id: 'odp-hoodie-classic-black', name: 'Classic Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 55.00, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500' },
    { id: 'odp-hoodie-zip-black', name: 'Zip Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 62.00, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500' },
  ],

  // HATS
  hats: [
    { id: 'odp-snapback-black', name: 'Snapback Hat', category: 'Accessories', subcategory: 'Hats', basePrice: 28.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500' },
    { id: 'odp-beanie-black', name: 'Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 24.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500' },
    { id: 'odp-dad-hat-black', name: 'Dad Hat', category: 'Accessories', subcategory: 'Hats', basePrice: 22.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=500' },
  ],

  // MUGS
  mugs: [
    { id: 'odp-mug-11oz-black', name: 'Coffee Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 18.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500' },
    { id: 'odp-mug-travel-black', name: 'Travel Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 28.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1534294668821-28a3054f4256?w=500' },
  ],

  // STICKERS
  stickers: [
    { id: 'odp-sticker-3x3', name: 'Sticker', category: 'Accessories', subcategory: 'Stickers', basePrice: 5.00, colors: ['Full Color'], image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500' },
    { id: 'odp-sticker-pack', name: 'Sticker Pack (5 pcs)', category: 'Accessories', subcategory: 'Stickers', basePrice: 15.00, colors: ['Mixed'], image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=500' },
  ],

  // POSTERS
  posters: [
    { id: 'odp-poster-12x16', name: 'Poster 12x16', category: 'Art', subcategory: 'Posters', basePrice: 15.00, colors: ['White'], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' },
    { id: 'odp-poster-18x24', name: 'Poster 18x24', category: 'Art', subcategory: 'Posters', basePrice: 22.00, colors: ['White'], image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500' },
  ],

  // CANVAS
  canvas: [
    { id: 'odp-canvas-12x12', name: 'Canvas 12x12', category: 'Art', subcategory: 'Canvas', basePrice: 45.00, colors: ['Natural'], image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500' },
    { id: 'odp-canvas-16x20', name: 'Canvas 16x20', category: 'Art', subcategory: 'Canvas', basePrice: 55.00, colors: ['Natural'], image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=500' },
  ],

  // BAGS
  bags: [
    { id: 'odp-tote-black', name: 'Tote Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 20.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500' },
    { id: 'odp-drawstring-black', name: 'Drawstring Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 18.00, colors: ['Black'], image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500' },
  ],

  // BOOKS
  books: [
    { id: 'odp-book-tiigh', name: 'There It Is, Here It Go', category: 'Books', subcategory: 'Books', basePrice: 25.00, colors: ['Softcover'], image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'The debut book from O D Porter — a raw collection of prose and reflections.' },
  ],
}

// Flatten all products into a single array for API
export const ALL_PRODUCTS = [
  ...PRINTFUL_CATALOG.tshirts,
  ...PRINTFUL_CATALOG.hoodies,
  ...PRINTFUL_CATALOG.hats,
  ...PRINTFUL_CATALOG.mugs,
  ...PRINTFUL_CATALOG.stickers,
  ...PRINTFUL_CATALOG.posters,
  ...PRINTFUL_CATALOG.canvas,
  ...PRINTFUL_CATALOG.bags,
  ...PRINTFUL_CATALOG.books,
].map((p, i) => ({
  ...p,
  id: p.id || `product-${i}`,
  images: [p.image],
  rating: 4.3 + (Math.random() * 0.7),
  reviews: Math.floor(Math.random() * 150) + 20,
  inStock: true,
}))

console.log(`Total products loaded: ${ALL_PRODUCTS.length}`)
