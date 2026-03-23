import { NextRequest, NextResponse } from 'next/server'

// Printful product catalog - everyday products people use
const PRINTFUL_PRODUCTS = [
  // PHONE CASES
  { id: 'phone-case-iphone-15', name: 'iPhone 15 Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, colors: ['Black', 'White', 'Navy', 'Red'], images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'] },
  { id: 'phone-case-iphone-14', name: 'iPhone 14 Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, colors: ['Black', 'White', 'Navy', 'Pink'], images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'] },
  { id: 'phone-case-iphone-13', name: 'iPhone 13 Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 5.50, printfulId: 159, colors: ['Black', 'White', 'Blue'], images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'] },
  { id: 'phone-case-samsung-s24', name: 'Samsung Galaxy S24 Case', category: 'Tech', subcategory: 'Phone Cases', basePrice: 6.00, printfulId: 159, colors: ['Black', 'White', 'Navy'], images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'] },
  
  // T-SHIRTS
  { id: 'tshirt-premium-black', name: 'Premium Black Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'] },
  { id: 'tshirt-premium-white', name: 'Premium White Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['White'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: ['https://images.unsplash.com/photo-1529370259744-1008419292953?w=500'] },
  { id: 'tshirt-premium-navy', name: 'Premium Navy Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Navy'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500'] },
  { id: 'tshirt-premium-gray', name: 'Premium Gray Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 8.50, printfulId: 71, colors: ['Heather Gray'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500'] },
  { id: 'tshirt-vintage-black', name: 'Vintage Black Tee', category: 'Apparel', subcategory: 'T-Shirts', basePrice: 10.00, printfulId: 171, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'] },
  
  // HOODIES
  { id: 'hoodie-premium-black', name: 'Premium Black Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 22.00, printfulId: 156, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'] },
  { id: 'hoodie-premium-navy', name: 'Premium Navy Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 22.00, printfulId: 156, colors: ['Navy'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'] },
  { id: 'hoodie-zip-black', name: 'Zip-Up Black Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 26.00, printfulId: 179, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'] },
  { id: 'hoodie-zip-gray', name: 'Zip-Up Gray Hoodie', category: 'Apparel', subcategory: 'Hoodies', basePrice: 26.00, printfulId: 179, colors: ['Heather Gray'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'] },
  
  // LONG SLEEVE
  { id: 'longsleeve-black', name: 'Black Long Sleeve Tee', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1618354691373-d851c2f59e71?w=500'] },
  { id: 'longsleeve-white', name: 'White Long Sleeve Tee', category: 'Apparel', subcategory: 'Long Sleeve', basePrice: 12.00, printfulId: 11, colors: ['White'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1618354691373-d851c59e71?w=500'] },
  
  // TANK TOPS
  { id: 'tank-black', name: 'Black Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['Black'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1503341503090-5933f6f5cc8c?w=500'] },
  { id: 'tank-white', name: 'White Tank Top', category: 'Apparel', subcategory: 'Tank Tops', basePrice: 9.00, printfulId: 139, colors: ['White'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://images.unsplash.com/photo-1503341503090-5933f6f5cc8c?w=500'] },
  
  // MUGS
  { id: 'mug-11oz-white', name: 'Classic White Mug 11oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 4.50, printfulId: 14, colors: ['White'], images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'] },
  { id: 'mug-15oz-white', name: 'Large White Mug 15oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 5.50, printfulId: 16, colors: ['White'], images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'] },
  { id: 'mug-travel', name: 'Travel Mug 12oz', category: 'Home & Living', subcategory: 'Mugs', basePrice: 8.00, printfulId: 187, colors: ['Black', 'White'], images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500'] },
  
  // TOTE BAGS
  { id: 'tote-canvas-natural', name: 'Canvas Tote Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 5.00, printfulId: 18, colors: ['Natural'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1597484661973-ee6cd0b6482c?w=500'] },
  { id: 'tote-canvas-black', name: 'Black Tote Bag', category: 'Accessories', subcategory: 'Bags', basePrice: 5.00, printfulId: 18, colors: ['Black'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1597484661973-ee6cd0b6482c?w=500'] },
  
  // HATS
  { id: 'hat-snapback-black', name: 'Black Snapback Cap', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['Black'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89a?w=500'] },
  { id: 'hat-snapback-navy', name: 'Navy Snapback Cap', category: 'Accessories', subcategory: 'Hats', basePrice: 7.00, printfulId: 15, colors: ['Navy'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89a?w=500'] },
  { id: 'beanie-black', name: 'Premium Black Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 6.50, printfulId: 31, colors: ['Black'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1576871337632-b514a07d5025?w=500'] },
  { id: 'beanie-gray', name: 'Gray Beanie', category: 'Accessories', subcategory: 'Hats', basePrice: 6.50, printfulId: 31, colors: ['Heather Gray'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1576871337632-b514a07d5025?w=500'] },
  
  // POSTERS
  { id: 'poster-18x24', name: 'Poster 18x24', category: 'Art', subcategory: 'Posters', basePrice: 4.00, printfulId: 69, colors: ['White'], sizes: ['18x24'], images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500'] },
  { id: 'poster-24x36', name: 'Large Poster 24x36', category: 'Art', subcategory: 'Posters', basePrice: 6.00, printfulId: 69, colors: ['White'], sizes: ['24x36'], images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500'] },
  
  // CANVAS
  { id: 'canvas-16x20', name: 'Canvas Print 16x20', category: 'Art', subcategory: 'Canvas', basePrice: 18.00, printfulId: 101, colors: ['Natural'], sizes: ['16x20'], images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500'] },
  { id: 'canvas-20x30', name: 'Large Canvas 20x30', category: 'Art', subcategory: 'Canvas', basePrice: 28.00, printfulId: 101, colors: ['Natural'], sizes: ['20x30'], images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=500'] },
  
  // MOUSE PADS
  { id: 'mousepad-standard', name: 'Standard Mouse Pad', category: 'Tech', subcategory: 'Mouse Pads', basePrice: 4.00, printfulId: 162, colors: ['Black'], sizes: ['9x8'], images: ['https://images.unsplash.com/photo-1527864550417-6fd30bf1eb4c?w=500'] },
  { id: 'mousepad-gaming', name: 'Gaming Mouse Pad XL', category: 'Tech', subcategory: 'Mouse Pads', basePrice: 7.00, printfulId: 163, colors: ['Black'], sizes: ['12x18'], images: ['https://images.unsplash.com/photo-1527864550417-6fd30bf1eb4c?w=500'] },
  
  // STICKERS
  { id: 'sticker-3x3', name: 'Sticker 3x3', category: 'Accessories', subcategory: 'Stickers', basePrice: 1.50, printfulId: 86, colors: ['Full Color'], sizes: ['3x3'], images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'] },
  { id: 'sticker-4x4', name: 'Sticker 4x4', category: 'Accessories', subcategory: 'Stickers', basePrice: 2.00, printfulId: 86, colors: ['Full Color'], sizes: ['4x4'], images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'] },
  { id: 'sticker-pack-50', name: 'Sticker Pack (50 pcs)', category: 'Accessories', subcategory: 'Stickers', basePrice: 25.00, printfulId: 86, colors: ['Mixed'], sizes: ['Assorted'], images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'] },
  
  // PILLOWS
  { id: 'pillow-16x16', name: 'Throw Pillow 16x16', category: 'Home & Living', subcategory: 'Pillows', basePrice: 12.00, printfulId: 123, colors: ['White'], sizes: ['16x16'], images: ['https://images.unsplash.com/photo-1584100936575-8b5b0b0b0b0b?w=500'] },
  { id: 'pillow-18x18', name: 'Large Pillow 18x18', category: 'Home & Living', subcategory: 'Pillows', basePrice: 15.00, printfulId: 123, colors: ['White'], sizes: ['18x18'], images: ['https://images.unsplash.com/photo-1584100936575-8b5b0b0b0b0b?w=500'] },
  
  // APRONS
  { id: 'apron-cook', name: 'Cooking Apron', category: 'Home & Living', subcategory: 'Aprons', basePrice: 9.00, printfulId: 197, colors: ['White', 'Black'], sizes: ['One Size'], images: ['https://images.unsplash.com/photo-1556909114-44e3e9396d39?w=500'] },
  
  // WATER BOTTLES
  { id: 'bottle-20oz', name: 'Water Bottle 20oz', category: 'Accessories', subcategory: 'Bottles', basePrice: 7.00, printfulId: 166, colors: ['White', 'Black'], sizes: ['20oz'], images: ['https://images.unsplash.com/photo-1602143407151-6111d5a5e50?w=500'] },
  
  // BLANKETS
  { id: 'blanket-50x60', name: 'Fleece Blanket 50x60', category: 'Home & Living', subcategory: 'Blankets', basePrice: 25.00, printfulId: 117, colors: ['White'], sizes: ['50x60'], images: ['https://images.unsplash.com/photo-1555041469-a586c5ea26d8?w=500'] },
  
  // TOWELS
  { id: 'towel-beach', name: 'Beach Towel', category: 'Home & Living', subcategory: 'Towels', basePrice: 12.00, printfulId: 188, colors: ['White'], sizes: ['30x60'], images: ['https://images.unsplash.com/photo-1595320421444-9083e7e6b1e7?w=500'] },
  
  // VINYL (Music)
  { id: 'vinyl-12', name: '12" Vinyl Record', category: 'Music', subcategory: 'Vinyl', basePrice: 12.00, printfulId: null, colors: ['Black'], sizes: ['12"'], images: ['https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500'] },
  { id: 'cd-jewel', name: 'CD Jewel Case', category: 'Music', subcategory: 'CDs', basePrice: 2.50, printfulId: null, colors: ['Standard'], sizes: ['Standard'], images: ['https://images.unsplash.com/photo-1493225457124-86f2d44d1cd4?w=500'] },
]

// Artist margin based on tier
const ARTIST_MARGINS = {
  'new': 0.60,
  'growing': 0.70,
  'established': 0.80
}

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const subcategory = searchParams.get('subcategory')
  const search = searchParams.get('search')
  const limit = parseInt(searchParams.get('limit') || '100')
  
  let products = [...PRINTFUL_PRODUCTS]
  
  // Filter by category
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase())
  }
  
  // Filter by subcategory
  if (subcategory) {
    products = products.filter(p => p.subcategory?.toLowerCase() === subcategory.toLowerCase())
  }
  
  // Search
  if (search) {
    const searchLower = search.toLowerCase()
    products = products.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.category.toLowerCase().includes(searchLower) ||
      p.subcategory?.toLowerCase().includes(searchLower)
    )
  }
  
  // Calculate sale price (30% markup default)
  products = products.map(p => ({
    ...p,
    salePrice: Math.round(p.basePrice * 1.3 * 100) / 100,
    inStock: true,
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 100) + 10
  }))
  
  return NextResponse.json({
    products: products.slice(0, limit),
    total: products.length,
    categories: [...new Set(products.map(p => p.category))],
    subcategories: [...new Set(products.map(p => p.subcategory).filter(Boolean))]
  })
}

// GET /api/products/[id] - Get single product
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { id } = body
  
  const product = PRINTFUL_PRODUCTS.find(p => p.id === id)
  
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  
  return NextResponse.json({
    ...product,
    salePrice: Math.round(product.basePrice * 1.3 * 100) / 100,
    inStock: true,
    rating: 4.7,
    reviews: 89
  })
}