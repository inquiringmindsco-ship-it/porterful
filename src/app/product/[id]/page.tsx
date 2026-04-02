'use client'

import { useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, Shield, Truck, ArrowLeft, Check } from 'lucide-react'
import { getProductById } from '@/lib/products'
import { useCart } from '@/lib/cart-context'

export default function ProductPage() {
  const params = useParams()
  const product = getProductById(params.id as string)
  const { addItem } = useCart()

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  if (!product) {
    return (
      <div className="min-h-screen pt-20 pb-24">
        <div className="pf-container text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-[var(--pf-text-secondary)] mb-6">This product doesn't exist or has been removed.</p>
          <Link href="/store" className="pf-btn pf-btn-primary">Browse Store</Link>
        </div>
      </div>
    )
  }

  const colors = product.colors || []
  const sizes = product.sizes || []
  const images = product.images || [product.image]

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      artist: product.artist,
      artistCut: product.artistCut || product.price * 0.8,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container">
        {/* Back */}
        <Link href="/store" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] mb-4">
              <Image
                src={images[activeImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-[var(--pf-orange)]' : 'border-transparent'
                    }`}
                  >
                    <Image src={img} alt="" width={80} height={80} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)]">
                {product.category} • {product.artist}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            {product.sales !== undefined && product.sales > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[var(--pf-text-muted)]">
                  {product.rating} ({product.reviews} reviews) • {product.sales} sold
                </span>
              </div>
            )}

            <div className="text-4xl font-bold text-[var(--pf-orange)] mb-6">${product.price}</div>

            {product.description && (
              <p className="text-[var(--pf-text-secondary)] mb-6 leading-relaxed">{product.description}</p>
            )}

            {product.format && (
              <div className="mb-4 text-sm text-[var(--pf-text-secondary)]">
                <strong>Format:</strong> {product.format}
                {product.tracks && ` • ${product.tracks} tracks`}
              </div>
            )}

            {/* Color selection */}
            {colors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Color: {selectedColor}</p>
                <div className="flex gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        selectedColor === color
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]'
                          : 'border-[var(--pf-border)] hover:border-white/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Size: {selectedSize}</p>
                <div className="flex gap-2">
                  {sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                        selectedSize === size
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]'
                          : 'border-[var(--pf-border)] hover:border-white/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-4 flex items-center justify-center gap-2 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white shadow-lg shadow-[var(--pf-orange)]/20'
              }`}
            >
              {added ? (
                <><Check size={20} /> Added to Cart</>
              ) : (
                <>Add to Cart — ${product.price}</>
              )}
            </button>

            {/* Artist link */}
            <Link
              href={`/artist/${product.artist.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/\s+/g, '-')}`}
              className="block text-center text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] mb-6 transition-colors"
            >
              More from {product.artist} →
            </Link>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[var(--pf-border)]">
              <div className="text-center">
                <Shield size={18} className="mx-auto text-green-500 mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">Secure Checkout</p>
              </div>
              <div className="text-center">
                <Heart size={18} className="mx-auto text-[var(--pf-orange)] mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">80% to Artist</p>
              </div>
              <div className="text-center">
                <Truck size={18} className="mx-auto text-blue-400 mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">Ships Worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
