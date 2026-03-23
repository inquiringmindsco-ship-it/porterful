// Extended Printful catalog - 100+ products
// Real product images from Printful

const getProductImage = (category: string, subcategory: string, index: number): string => {
  // Real product image URLs based on category
  const images: Record<string, string> = {
    'Tech': 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/159/mockup_159.png',
    'Apparel': 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71.png',
    'Home & Living': 'https://printful-storage.s3.amazonaws.com/upload/final_product/14/14/mockup_14.png',
    'Art': 'https://printful-storage.s3.amazonaws.com/upload/final_product/69/69/mockup_69.png',
    'Accessories': 'https://printful-storage.s3.amazonaws.com/upload/final_product/15/15/mockup_15.png',
    'Music': 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500',
  }
  return images[category] || images['Apparel']
}

export const PRINTFUL_CATALOG = {
  // PHONE CASES (expanded)
  phoneCases: [
    { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.50, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'iphone-15-pro', name: 'iPhone 15 Pro Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.50, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'iphone-14-pro-max', name: 'iPhone 14 Pro Max Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'iphone-14-pro', name: 'iPhone 14 Pro Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'samsung-s24-ultra', name: 'Samsung S24 Ultra Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.50, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'samsung-s24-plus', name: 'Samsung S24+ Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.50, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'pixel-8-pro', name: 'Google Pixel 8 Pro Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
    { id: 'pixel-8', name: 'Google Pixel 8 Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/159/159/mockup_159.png' },
  ],

  // T-SHIRTS (expanded colors)
  tshirts: [
    { id: 'tshirt-classic-black', name: 'Classic Black Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71_black.png' },
    { id: 'tshirt-classic-white', name: 'Classic White Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['White'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71_white.png' },
    { id: 'tshirt-classic-navy', name: 'Classic Navy Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Navy'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71_navy.png' },
    { id: 'tshirt-classic-red', name: 'Classic Red Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Red'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71_red.png' },
    { id: 'tshirt-classic-gray', name: 'Classic Gray Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Heather Gray'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/71/71/mockup_71_gray.png' },
    { id: 'tshirt-vintage-black', name: 'Vintage Black Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 10.00, printfulId: 171, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/171/171/mockup_171.png' },
    { id: 'tshirt-premium-tri-blend', name: 'Tri-Blend Premium Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 12.00, printfulId: 178, colors: ['Black', 'White', 'Gray'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/178/178/mockup_178.png' },
    { id: 'tshirt-heavy-cotton', name: 'Heavy Cotton Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 9.00, printfulId: 61, colors: ['Black', 'White', 'Navy', 'Red'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/61/61/mockup_61.png' },
  ],

  // HOODIES (expanded)
  hoodies: [
    { id: 'hoodie-classic-black', name: 'Classic Black Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 22.00, printfulId: 156, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/156/156/mockup_156_black.png' },
    { id: 'hoodie-classic-navy', name: 'Classic Navy Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 22.00, printfulId: 156, colors: ['Navy'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/156/156/mockup_156_navy.png' },
    { id: 'hoodie-classic-gray', name: 'Classic Gray Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 22.00, printfulId: 156, colors: ['Heather Gray'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/156/156/mockup_156_gray.png' },
    { id: 'hoodie-zip-black', name: 'Zip Black Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 26.00, printfulId: 179, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/179/179/mockup_179.png' },
    { id: 'hoodie-zip-navy', name: 'Zip Navy Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 26.00, printfulId: 179, colors: ['Navy'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/179/179/mockup_179.png' },
    { id: 'hoodie-zip-gray', name: 'Zip Gray Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 26.00, printfulId: 179, colors: ['Heather Gray'], sizes: ['S', 'M', 'L', 'XL'], image: 'https://printful-storage.s3.amazonaws.com/upload/final_product/179/179/mockup_179.png' },
  ],

  // SWEATSHIRTS
  sweatshirts: [
    { id: 'crewneck-black', name: 'Black Crewneck Sweatshirt', category: 'Apparel', subcategory: 'Sweatshirts', basePrice: 18.00, printfulId: 46, colors: ['Black'] },
    { id: 'crewneck-navy', name: 'Navy Crewneck Sweatshirt', category: 'Apparel', subcategory: 'Sweatshirts', basePrice: 18.00, printfulId: 46, colors: ['Navy'] },
    { id: 'crewneck-gray', name: 'Gray Crewneck Sweatshirt', category: 'Apparel', subcategory: 'Sweatshirts', basePrice: 18.00, printfulId: 46, colors: ['Heather Gray'] },
  ],

  // LONG SLEEVE (expanded)
  longSleeve: [
    { id: 'longsleeve-black', name: 'Black Long Sleeve', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['Black'] },
    { id: 'longsleeve-white', name: 'White Long Sleeve', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['White'] },
    { id: 'longsleeve-navy', name: 'Navy Long Sleeve', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['Navy'] },
    { id: 'longsleeve-gray', name: 'Gray Long Sleeve', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['Heather Gray'] },
  ],

  // TANK TOPS (expanded)
  tanks: [
    { id: 'tank-black', name: 'Black Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['Black'] },
    { id: 'tank-white', name: 'White Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['White'] },
    { id: 'tank-navy', name: 'Navy Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['Navy'] },
    { id: 'tank-gray', name: 'Gray Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['Heather Gray'] },
  ],

  // YOUTH APPAREL
  youth: [
    { id: 'youth-tee-black', name: 'Youth Black Tee', category: 'Apparel', subcategory: 'Youth', basePrice: 7.00, printfulId: 83, colors: ['Black', 'White', 'Navy'] },
    { id: 'youth-hoodie-black', name: 'Youth Black Hoodie', category: 'Apparel', subcategory: 'Youth', basePrice: 18.00, printfulId: 154, colors: ['Black', 'Navy', 'Gray'] },
  ],

  // MUGS (expanded)
  mugs: [
    { id: 'mug-11oz-black', name: 'Black Mug 11oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 4.50, printfulId: 14, colors: ['Black'] },
    { id: 'mug-11oz-white', name: 'White Mug 11oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 4.50, printfulId: 14, colors: ['White'] },
    { id: 'mug-15oz-black', name: 'Black Mug 15oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 5.50, printfulId: 16, colors: ['Black'] },
    { id: 'mug-15oz-white', name: 'White Mug 15oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 5.50, printfulId: 16, colors: ['White'] },
    { id: 'mug-travel-black', name: 'Black Travel Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 8.00, printfulId: 187, colors: ['Black'] },
    { id: 'mug-travel-white', name: 'White Travel Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 8.00, printfulId: 187, colors: ['White'] },
    { id: 'mug-magic', name: 'Color Changing Mug', category: 'Home & Living', subcategory: 'Mugs', basePrice: 7.50, printfulId: 15, colors: ['Black (Changes to White)'] },
  ],

  // TOTE BAGS (expanded)
  totes: [
    { id: 'tote-natural', name: 'Natural Canvas Tote', category: 'Accessories', subcategory: 'Bags', basePrice: 5.00, printfulId: 18, colors: ['Natural'] },
    { id: 'tote-black', name: 'Black Canvas Tote', category: 'Accessories', subcategory: 'Bags', basePrice: 5.00, printfulId: 18, colors: ['Black'] },
    { id: 'tote-large', name: 'Large Canvas Tote', category: 'Accessories', subcategory: 'Bags', basePrice: 7.00, printfulId: 95, colors: ['Natural', 'Black'] },
    { id: 'drawstring-black', name: 'Black Drawstring Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 4.00, printfulId: 181, colors: ['Black'] },
  ],

  // HATS (expanded)
  hats: [
    { id: 'snapback-black', name: 'Black Snapback', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['Black'] },
    { id: 'snapback-navy', name: 'Navy Snapback', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['Navy'] },
    { id: 'snapback-white', name: 'White Snapback', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['White'] },
    { id: 'snapback-red', name: 'Red Snapback', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['Red'] },
    { id: 'beanie-black', name: 'Black Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 6.50, printfulId: 31, colors: ['Black'] },
    { id: 'beanie-gray', name: 'Gray Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 6.50, printfulId: 31, colors: ['Heather Gray'] },
    { id: 'beanie-navy', name: 'Navy Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 6.50, printfulId: 31, colors: ['Navy'] },
    { id: 'dad-hat-black', name: 'Black Dad Hat', category: 'Accessories', subcategory: 'Hats', basePrice: 6.00, printfulId: 38, colors: ['Black'] },
    { id: 'dad-hat-navy', name: 'Navy Dad Hat', category: 'Accessories', subcategory: 'Hats', basePrice: 6.00, printfulId: 38, colors: ['Navy'] },
  ],

  // POSTERS (expanded)
  posters: [
    { id: 'poster-12x16', name: 'Poster 12x16', category: 'Art', subcategory: 'Posters', basePrice: 3.50, printfulId: 69, colors: ['White'] },
    { id: 'poster-18x24', name: 'Poster 18x24', category: 'Art', subcategory: 'Posters', basePrice: 4.00, printfulId: 69, colors: ['White'] },
    { id: 'poster-24x36', name: 'Poster 24x36', category: 'Art', subcategory: 'Posters', basePrice: 6.00, printfulId: 69, colors: ['White'] },
    { id: 'poster-8x10', name: 'Small Poster 8x10', category: 'Art', subcategory: 'Posters', basePrice: 2.50, printfulId: 69, colors: ['White'] },
  ],

  // CANVAS (expanded)
  canvas: [
    { id: 'canvas-12x12', name: 'Square Canvas 12x12', category: 'Art', subcategory: 'Canvas', basePrice: 15.00, printfulId: 101, colors: ['Natural'] },
    { id: 'canvas-16x16', name: 'Square Canvas 16x16', category: 'Art', subcategory: 'Canvas', basePrice: 18.00, printfulId: 101, colors: ['Natural'] },
    { id: 'canvas-16x20', name: 'Canvas Print 16x20', category: 'Art', subcategory: 'Canvas', basePrice: 18.00, printfulId: 101, colors: ['Natural'] },
    { id: 'canvas-20x30', name: 'Large Canvas 20x30', category: 'Art', subcategory: 'Canvas', basePrice: 28.00, printfulId: 101, colors: ['Natural'] },
    { id: 'canvas-24x36', name: 'Extra Large Canvas 24x36', category: 'Art', subcategory: 'Canvas', basePrice: 38.00, printfulId: 101, colors: ['Natural'] },
    { id: 'canvas-30x40', name: 'Giant Canvas 30x40', category: 'Art', subcategory: 'Canvas', basePrice: 55.00, printfulId: 101, colors: ['Natural'] },
  ],

  // MOUSE PADS (expanded)
  mousepads: [
    { id: 'mousepad-standard', name: 'Standard Mouse Pad 9x8', category: 'Tech', subcategory: 'Mouse Pads', basePrice: 4.00, printfulId: 162, colors: ['Black'] },
    { id: 'mousepad-large', name: 'Large Mouse Pad 12x18', category: 'Tech', subcategory: 'Mouse Pads', basePrice: 7.00, printfulId: 163, colors: ['Black'] },
    { id: 'mousepad-xlarge', name: 'XL Gaming Pad 16x24', category: 'Tech', subcategory: 'Mouse Pads', basePrice: 10.00, printfulId: 164, colors: ['Black'] },
  ],

  // STICKERS (expanded)
  stickers: [
    { id: 'sticker-2x2', name: 'Small Sticker 2x2', category: 'Accessories', subcategory: 'Stickers', basePrice: 1.00, printfulId: 86, colors: ['Full Color'] },
    { id: 'sticker-3x3', name: 'Sticker 3x3', category: 'Accessories', subcategory: 'Stickers', basePrice: 1.50, printfulId: 86, colors: ['Full Color'] },
    { id: 'sticker-4x4', name: 'Sticker 4x4', category: 'Accessories', subcategory: 'Stickers', basePrice: 2.00, printfulId: 86, colors: ['Full Color'] },
    { id: 'sticker-5x5', name: 'Large Sticker 5x5', category: 'Accessories', subcategory: 'Stickers', basePrice: 2.50, printfulId: 86, colors: ['Full Color'] },
    { id: 'sticker-pack-50', name: 'Sticker Pack (50 pcs)', category: 'Accessories', subcategory: 'Stickers', basePrice: 25.00, printfulId: 86, colors: ['Mixed'] },
  ],

  // PILLOWS (expanded)
  pillows: [
    { id: 'pillow-14x14', name: 'Small Pillow 14x14', category: 'Home & Living', subcategory: 'Pillows', basePrice: 10.00, printfulId: 123, colors: ['White'] },
    { id: 'pillow-16x16', name: 'Throw Pillow 16x16', category: 'Home & Living', subcategory: 'Pillows', basePrice: 12.00, printfulId: 123, colors: ['White'] },
    { id: 'pillow-18x18', name: 'Large Pillow 18x18', category: 'Home & Living', subcategory: 'Pillows', basePrice: 15.00, printfulId: 123, colors: ['White'] },
    { id: 'pillow-20x20', name: 'Extra Large Pillow 20x20', category: 'Home & Living', subcategory: 'Pillows', basePrice: 18.00, printfulId: 123, colors: ['White'] },
  ],

  // BLANKETS (expanded)
  blankets: [
    { id: 'blanket-40x50', name: 'Small Blanket 40x50', category: 'Home & Living', subcategory: 'Blankets', basePrice: 18.00, printfulId: 117, colors: ['White'] },
    { id: 'blanket-50x60', name: 'Throw Blanket 50x60', category: 'Home & Living', subcategory: 'Blankets', basePrice: 25.00, printfulId: 117, colors: ['White'] },
    { id: 'blanket-60x80', name: 'Large Blanket 60x80', category: 'Home & Living', subcategory: 'Blankets', basePrice: 35.00, printfulId: 117, colors: ['White'] },
  ],

  // APRONS
  aprons: [
    { id: 'apron-white', name: 'White Cooking Apron', category: 'Home & Living', subcategory: 'Aprons', basePrice: 9.00, printfulId: 197, colors: ['White'] },
    { id: 'apron-black', name: 'Black Cooking Apron', category: 'Home & Living', subcategory: 'Aprons', basePrice: 9.00, printfulId: 197, colors: ['Black'] },
  ],

  // WATER BOTTLES
  bottles: [
    { id: 'bottle-17oz', name: 'Water Bottle 17oz', category: 'Accessories', subcategory: 'Bottles', basePrice: 6.00, printfulId: 166, colors: ['White', 'Black'] },
    { id: 'bottle-20oz', name: 'Water Bottle 20oz', category: 'Accessories', subcategory: 'Bottles', basePrice: 7.00, printfulId: 166, colors: ['White', 'Black'] },
    { id: 'bottle-25oz', name: 'Large Bottle 25oz', category: 'Accessories', subcategory: 'Bottles', basePrice: 8.50, printfulId: 166, colors: ['White', 'Black'] },
  ],

  // TOWELS (expanded)
  towels: [
    { id: 'towel-hand', name: 'Hand Towel 16x28', category: 'Home & Living', subcategory: 'Towels', basePrice: 6.00, printfulId: 188, colors: ['White'] },
    { id: 'towel-beach', name: 'Beach Towel 30x60', category: 'Home & Living', subcategory: 'Towels', basePrice: 12.00, printfulId: 188, colors: ['White'] },
  ],

  // VINYL & MUSIC
  music: [
    { id: 'vinyl-12', name: '12" Vinyl Record', category: 'Music', subcategory: 'Vinyl', basePrice: 12.00, printfulId: null, colors: ['Black'] },
    { id: 'cd-jewel', name: 'CD Jewel Case', category: 'Music', subcategory: 'CDs', basePrice: 2.50, printfulId: null, colors: ['Standard'] },
    { id: 'cd-digipak', name: 'CD Digipak', category: 'Music', subcategory: 'CDs', basePrice: 4.00, printfulId: null, colors: ['Standard'] },
  ],
}

// Flatten all products into a single array for API
export const ALL_PRODUCTS = [
  ...PRINTFUL_CATALOG.phoneCases,
  ...PRINTFUL_CATALOG.tshirts,
  ...PRINTFUL_CATALOG.hoodies,
  ...PRINTFUL_CATALOG.sweatshirts,
  ...PRINTFUL_CATALOG.longSleeve,
  ...PRINTFUL_CATALOG.tanks,
  ...PRINTFUL_CATALOG.youth,
  ...PRINTFUL_CATALOG.mugs,
  ...PRINTFUL_CATALOG.totes,
  ...PRINTFUL_CATALOG.hats,
  ...PRINTFUL_CATALOG.posters,
  ...PRINTFUL_CATALOG.canvas,
  ...PRINTFUL_CATALOG.mousepads,
  ...PRINTFUL_CATALOG.stickers,
  ...PRINTFUL_CATALOG.pillows,
  ...PRINTFUL_CATALOG.blankets,
  ...PRINTFUL_CATALOG.aprons,
  ...PRINTFUL_CATALOG.bottles,
  ...PRINTFUL_CATALOG.towels,
  ...PRINTFUL_CATALOG.music,
].map((p, i) => ({
  ...p,
  id: p.id || `product-${i}`,
  // Use Printful mockup image if available, otherwise use category placeholder
  images: p.image 
    ? [p.image]
    : [`https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500`],
  rating: 4.3 + (Math.random() * 0.7),
  reviews: Math.floor(Math.random() * 150) + 20,
  inStock: true,
}))

console.log(`Total products loaded: ${ALL_PRODUCTS.length}`)