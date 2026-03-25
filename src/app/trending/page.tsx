import Link from 'next/link'
import { TrendingUp, Flame, Clock, ChevronRight } from 'lucide-react'

// Demo trending products
const TRENDING_PRODUCTS = [
  { id: '1', name: 'Wireless Earbuds Pro', price: 49.99, sales: 2847, trend: '+127%', emoji: '🎧', artist: 'O D' },
  { id: '2', name: 'Phone Charger Cable (3-Pack)', price: 15.99, sales: 1956, trend: '+89%', emoji: '🔌', artist: 'O D' },
  { id: '3', name: 'Portable Bluetooth Speaker', price: 29.99, sales: 1834, trend: '+75%', emoji: '🔊', artist: 'O D' },
  { id: '4', name: 'LED Ring Light', price: 34.99, sales: 1567, trend: '+62%', emoji: '💡', artist: 'O D' },
  { id: '5', name: 'Mechanical Keyboard', price: 79.99, sales: 1234, trend: '+58%', emoji: '⌨️', artist: 'O D' },
  { id: '6', name: 'USB-C Hub (7-in-1)', price: 39.99, sales: 1098, trend: '+45%', emoji: '🔌', artist: 'O D' },
  { id: '7', name: 'Gaming Mouse', price: 24.99, sales: 987, trend: '+41%', emoji: '🖱️', artist: 'O D' },
  { id: '8', name: 'Webcam HD', price: 59.99, sales: 876, trend: '+38%', emoji: '📷', artist: 'O D' },
]

const CATEGORIES = ['All', 'Tech', 'Home', 'Audio', 'Gaming', 'Camera', 'Wellness']

export default function TrendingPage() {
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
            What's <span className="text-[var(--pf-orange)]">Hot Right Now</span>
          </h1>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto">
            The products everyone's buying. Updated hourly. Every purchase supports independent artists.
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
            <Link href="/about" className="pf-btn pf-btn-secondary whitespace-nowrap">
              Learn More
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === 'All'
                  ? 'bg-[var(--pf-orange)] text-white'
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-secondary)] hover:text-white hover:bg-[var(--pf-surface-hover)]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Trending Products */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRENDING_PRODUCTS.map((product, i) => (
            <div key={product.id} className="pf-card group overflow-hidden relative">
              {/* Rank Badge */}
              <div className="absolute top-3 left-3 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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
                <div className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium flex items-center gap-1">
                  <TrendingUp size={12} />
                  {product.trend}
                </div>
              </div>

              <div className="aspect-square bg-gradient-to-br from-[var(--pf-surface)] to-[var(--pf-bg)] flex items-center justify-center text-6xl">
                {product.emoji}
              </div>
              <div className="p-4">
                <p className="text-xs text-[var(--pf-text-muted)] mb-1 flex items-center gap-2">
                  <Clock size={12} />
                  {product.sales.toLocaleString()} sold today
                </p>
                <h3 className="font-semibold mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-[var(--pf-orange)] mb-2">
                  Supports: {product.artist}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price}</span>
                  <button className="pf-btn pf-btn-primary text-sm py-2 px-4">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Trending */}
        <div className="mt-16 pf-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Why These Products Trend</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[var(--pf-orange)]/20 flex items-center justify-center">
                <TrendingUp className="text-[var(--pf-orange)]" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Data</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Updated every hour based on actual sales and engagement.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Flame className="text-blue-400" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Viral Products</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Products gaining traction on TikTok, Instagram, and beyond.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="text-purple-400" size={24} />
              </div>
              <h3 className="font-semibold mb-2">Artist-Curated</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">
                Products hand-picked by the artists you love.
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