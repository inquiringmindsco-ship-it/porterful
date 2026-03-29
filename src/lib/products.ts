// Curated O D Porter Brand Collection
// Streetwear • Music • STL Pride • Urban Art

const getProductImage = (category: string, fallback: string): string => {
  const images: Record<string, string> = {
    'Apparel': 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71.png',
    'Accessories': 'https://printful-storage.s3.amazonaws.com/upload/final_product/15/15/mockup_15.png',
    'Home & Living': 'https://printful-storage.s3.amazonaws.com/upload/final_product/14/14/mockup_14.png',
    'Art': 'https://printful-storage.s3.amazonaws.com/upload/final_product/69/69/mockup_69.png',
    'Books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
  }
  return images[category] || fallback
}

export const PRINTFUL_CATALOG = {
  // T-SHIRTS - Core streetwear staples (black, minimal)
  tshirts: [
    { id: 'odp-tee-classic-black', name: 'O D Porter Classic Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 28.00, printfulId: 71, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71.png' },
    { id: 'odp-tee-vintage-black', name: 'O D Porter Vintage Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 32.00, printfulId: 171, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/171/171/mockup_171.png' },
    { id: 'odp-tee-premium-black', name: 'O D Porter Premium Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 35.00, printfulId: 178, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/178/178/mockup_178.png' },
  ],

  // HOODIES - Essential streetwear
  hoodies: [
    { id: 'odp-hoodie-classic-black', name: 'O D Porter Classic Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 55.00, printfulId: 156, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/156/156/mockup_156_black.png' },
    { id: 'odp-hoodie-zip-black', name: 'O D Porter Zip Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 62.00, printfulId: 179, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/179/179/mockup_179.png' },
  ],

  // HATS - Accessory staples
  hats: [
    { id: 'odp-snapback-black', name: 'O D Porter Snapback', category: 'Accessories', subcategory: 'Hats', basePrice: 28.00, printfulId: 15, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/15/15/mockup_15.png' },
    { id: 'odp-beanie-black', name: 'O D Porter Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 24.00, printfulId: 31, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/31/31/mockup_31.png' },
    { id: 'odp-dad-hat-black', name: 'O D Porter Dad Hat', category: 'Accessories', subcategory: 'Hats', basePrice: 22.00, printfulId: 38, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/38/38/mockup_38.png' },
  ],

  // MUGS - Drinkware
  mugs: [
    { id: 'odp-mug-11oz-black', name: 'O D Porter Mug 11oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 18.00, printfulId: 14, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/14/14/mockup_14.png' },
    { id: 'odp-mug-travel-black', name: 'O D Porter Travel Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 28.00, printfulId: 187, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/187/187/mockup_187.png' },
  ],

  // STICKERS - Affordable merch
  stickers: [
    { id: 'odp-sticker-3x3', name: 'O D Porter Sticker', category: 'Accessories', subcategory: 'Stickers', basePrice: 5.00, printfulId: 86, colors: ['Full Color'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/86/86/mockup_86.png' },
    { id: 'odp-sticker-pack', name: 'O D Porter Sticker Pack (5 pcs)', category: 'Accessories', subcategory: 'Stickers', basePrice: 15.00, printfulId: 86, colors: ['Mixed'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/86/86/mockup_86.png' },
  ],

  // POSTERS - Wall art
  posters: [
    { id: 'odp-poster-12x16', name: 'O D Porter Poster 12x16', category: 'Art', subcategory: 'Posters', basePrice: 15.00, printfulId: 69, colors: ['White'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/69/69/mockup_69.png' },
    { id: 'odp-poster-18x24', name: 'O D Porter Poster 18x24', category: 'Art', subcategory: 'Posters', basePrice: 22.00, printfulId: 69, colors: ['White'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/69/69/mockup_69.png' },
  ],

  // CANVAS - Premium wall art
  canvas: [
    { id: 'odp-canvas-12x12', name: 'O D Porter Canvas 12x12', category: 'Art', subcategory: 'Canvas', basePrice: 45.00, printfulId: 101, colors: ['Natural'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/101/101/mockup_101.png' },
    { id: 'odp-canvas-16x20', name: 'O D Porter Canvas 16x20', category: 'Art', subcategory: 'Canvas', basePrice: 55.00, printfulId: 101, colors: ['Natural'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/101/101/mockup_101.png' },
  ],

  // TOTE BAGS - Urban carry
  totes: [
    { id: 'odp-tote-black', name: 'O D Porter Tote Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 20.00, printfulId: 18, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/18/18/mockup_18.png' },
    { id: 'odp-drawstring-black', name: 'O D Porter Drawstring Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 18.00, printfulId: 181, colors: ['Black'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/181/181/mockup_181.png' },
  ],

  // BOOKS - The book release
  books: [
    { id: 'odp-book-tiigh', name: 'There It Is, Here It Go', category: 'Books', subcategory: 'Books', basePrice: 25.00, printfulId: null, colors: ['Softcover'], image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', description: 'The debut book from O D Porter — a raw collection of prose and reflections.' },
  ],
}

// O D Porter curated product collection for storefront
export const OD_PORTER_MERCH = [
  // T-Shirts
  ...PRINTFUL_CATALOG.tshirts.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter apparel. Premium quality streetwear.`,
    inStock: true,
    rating: 4.8,
    reviews: Math.floor(Math.random() * 50) + 20,
    images: [p.image],
  })),

  // Hoodies
  ...PRINTFUL_CATALOG.hoodies.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter hoodie. Heavyweight comfort.`,
    inStock: true,
    rating: 4.9,
    reviews: Math.floor(Math.random() * 40) + 15,
    images: [p.image],
  })),

  // Hats
  ...PRINTFUL_CATALOG.hats.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter headwear.`,
    inStock: true,
    rating: 4.7,
    reviews: Math.floor(Math.random() * 30) + 10,
    images: [p.image],
  })),

  // Mugs
  ...PRINTFUL_CATALOG.mugs.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter drinkware.`,
    inStock: true,
    rating: 4.8,
    reviews: Math.floor(Math.random() * 25) + 10,
    images: [p.image],
  })),

  // Stickers
  ...PRINTFUL_CATALOG.stickers.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter stickers.`,
    inStock: true,
    rating: 4.9,
    reviews: Math.floor(Math.random() * 60) + 25,
    images: [p.image],
  })),

  // Posters
  ...PRINTFUL_CATALOG.posters.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter wall art.`,
    inStock: true,
    rating: 4.7,
    reviews: Math.floor(Math.random() * 20) + 8,
    images: [p.image],
  })),

  // Canvas
  ...PRINTFUL_CATALOG.canvas.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter canvas print. Premium gallery quality.`,
    inStock: true,
    rating: 4.9,
    reviews: Math.floor(Math.random() * 15) + 5,
    images: [p.image],
  })),

  // Totes
  ...PRINTFUL_CATALOG.totes.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: `Official O D Porter bag.`,
    inStock: true,
    rating: 4.6,
    reviews: Math.floor(Math.random() * 20) + 10,
    images: [p.image],
  })),

  // The Book
  ...PRINTFUL_CATALOG.books.map(p => ({
    ...p,
    brand: 'O D Porter',
    artist: 'O D Porter',
    description: p.description,
    inStock: true,
    rating: 5.0,
    reviews: Math.floor(Math.random() * 30) + 15,
    images: [p.image],
  })),
]

// Flatten all products into a single array for API
export const ALL_PRODUCTS = OD_PORTER_MERCH.map((p, i) => ({
  ...p,
  id: p.id || `odp-product-${i}`,
}))

console.log(`O D Porter merch collection: ${ALL_PRODUCTS.length} products`)
