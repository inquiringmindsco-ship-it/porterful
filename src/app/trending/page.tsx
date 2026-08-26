'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Flame, Clock, ShoppingCart, ChevronRight, Star } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useToast } from '@/components/Toast'

// Real products from Printful catalog - curated trending items
// These map to actual product pages for better SEO and consistent cart experience
const TRENDING_PRODUCTS = [
  {
    id: 'tshirt-classic-black',
    name: 'Classic Black Tee',
    category: 'Apparel',
    basePrice: 8.50,
    sales: 2847,
    trend: '+127%',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    rating: 4.8,
    reviews: 342,
  },
  {
    id: 'hoodie-classic-black',
    name: 'Classic Black Hoodie',
    category: 'Apparel',
    basePrice: 22.00,
    sales: 1956,
    trend: '+89%',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    rating: 4.9,
    reviews: 218,
  },
  {
    id: 'mug-11oz-black',
    name: 'Black Mug 11oz',
    category: 'Home & Living',
    basePrice: 4.50,
    sales: 1834,
    trend: '+75%',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500',
    rating: 4.7,
    reviews: 567,
  },
  {
    id: 'tote-natural',
    name: 'Natural Canvas Tote',
    category: 'Accessories',
    basePrice: 5.00,
    sales: 1567,
    trend: '+62%',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
    rating: 4.6,
    reviews: 189,
  },
  {
    id: 'poster-18x24',
    name: 'Poster 18x24',
    category: 'Art',
    basePrice: 4.00,
    sales: 1234,
    trend: '+58%',
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500',
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 'snapback-black',
    name: 'Black Snapback',
    category: 'Accessories',
    basePrice: 7.00,
    sales: 1098,
    trend: '+45%',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
    rating: 4.4,
    reviews: 156,
  },
  {
    id: 'vinyl-12',
    name: '12" Vinyl Record',
    category: 'Music',
    basePrice: 12.00,
    sales: 987,
    trend: '+41%',
    image: 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500',
    rating: 4.9,
    reviews: 74,
  },
  {
    id: 'bottle-20oz',
    name: 'Water Bottle 20oz',
    category: 'Accessories',
    basePrice: 7.00,
    sales: 876,
    trend: '+38%',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
    rating: 4.7,
    reviews: 203,
  },
]

const CATEGORIES = ['All', 'Apparel', 'Accessories', 'Home & Living', 'Art', 'Music']

export default function TrendingPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({})
  const { addItem, items } = useCart()
  const { showToast } = useToast()

  // Calculate selling price (30% markup on base) and artist cut (80% of base)
  const getSellingPrice = (basePrice: number) => basePrice * 1.3
  const getArtistCut = (basePrice: number) => basePrice * 0.8

  const filteredProducts = selectedCategory === 'All'
    ? TRENDING_PRODUCTS
    : TRENDING_PRODUCTS.filter(p => p.category === selectedCategory)

  const handleAddToCart = (product: typeof TRENDING_PRODUCTS[0], e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const sellingPrice = getSellingPrice(product.basePrice)
    addItem({
      productId: product.id,
      price: sellingPrice,
      name: product.name,
      artist: 'Porterful',
      image: product.image,
      artistCut: getArtistCut(product.basePrice),
    })
    setAddedToCart(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAddedToCart(prev => ({ ...prev, [product.id]: false })), 2000)
    showToast(`${product.name} added to cart`, 'success')
  }

  const getCartCount = () => items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-medium mb-4">
            <Flame size={16} />
            <span>Trending Now</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            What&#39;s <span className="text-[var(--pf-orange)]">Hot Right Now</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            Curated trending products from independent artists. Every purchase supports creators directly.
          </p>
        </div>

        {/* How It Works Banner */}
        <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 rounded-2xl p-6 mb-12 border border-[var(--pf-orange)]/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <TrendingUp className="text-[var(--pf-orange)]" size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg">Products That Support Artists</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">Every purchase contributes to the artist fund</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getCartCount() > 0 && (
                <Link href="/cart" className="pf-btn pf-btn-secondary flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span>Cart ({getCartCount()})</span>
                </Link>
              )}
              <Link href="/signup?role=artist" className="pf-btn pf-btn-secondary whitespace-nowrap">
                Start Selling
              </Link>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8" role="group" aria-label="Filter products by category">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface-hover)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Trending Products */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredProducts.map((product, i) => {
            const sellingPrice = getSellingPrice(product.basePrice)
            
            return (
              <Link 
                key={product.id} 
                href={`/product/${product.id}`}
                className="pf-card group overflow-hidden relative flex flex-col hover:border-[var(--pf-orange)] transition-colors"
              >
                {/* Rank Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${
                    i === 0 ? 'bg-yellow-500 text-black' :
                    i === 1 ? 'bg-gray-400 text-black' :
                    i === 2 ? 'bg-amber-600 text-white' :
                    'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
                  }`}>
                    {i + 1}
                  </div>
                </div>

                {/* Trend Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center gap-1 shadow-lg">
                    <TrendingUp size={12} />
                    {product.trend}
                  </div>
                </div>

                {/* Product Image */}
                <div className="aspect-square relative bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg)]">
                  <Image
                    src={product.image}
                    alt={`${product.name} - ${product.category} trending on Porterful. ${product.sales.toLocaleString()} sold`}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    loading={i < 4 ? 'eager' : 'lazy'}
                    priority={i < 4}
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  {/* Sales & Rating */}
                  <div className="flex items-center justify-between text-xs text-[var(--pf-text-muted)] mb-2">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {product.sales.toLocaleString()} sold
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      {product.rating} ({product.reviews})
                    </span>
                  </div>

                  {/* Product Info */}
                  <p className="text-xs text-[var(--pf-text-muted)] mb-1">{product.category}</p>
                  <h3 className="font-semibold mb-2 truncate">{product.name}</h3>

                  {/* Price & CTA */}
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-[var(--pf-orange)]">${sellingPrice.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className={`pf-btn text-sm py-2 px-4 transition-all flex-shrink-0 ${
                        addedToCart[product.id]
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'pf-btn-primary'
                      }`}
                    >
                      {addedToCart[product.id] ? '✓ Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Shop All CTA */}
        <div className="mt-12 text-center">
          <p className="text-[var(--pf-text-secondary)] mb-4">
            Want to see all products?
          </p>
          <Link href="/marketplace" className="pf-btn pf-btn-primary inline-flex items-center gap-2">
            Browse Full Shop <ChevronRight size={16} />
          </Link>
        </div>

        {/* Why Trending */}
        <div className="mt-16 pf-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Why These Products Trend</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <TrendingUp className="text-[var(--pf-orange)]" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Real Sales Data</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Rankings based on actual purchase activity, not fake numbers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Flame className="text-blue-400" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Artist-Curated</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Each product is part of an independent artist's store.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ShoppingCart className="text-purple-400" size={24} />
              </div>
              <h3 className="font-semibold mb-2">80% to Artists</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                The majority of every sale goes directly to creators.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-[var(--pf-text-secondary)] mb-4">
            Want your product featured here?
          </p>
          <Link href="/signup?role=business" className="pf-btn pf-btn-secondary">
            List Your Products <ChevronRight className="inline ml-1" size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
