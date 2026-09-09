'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, Heart, Shield, Truck, ArrowLeft, Check, Clock, Ruler, Package, Info } from 'lucide-react'
import { CONTROLLED_MERCH } from '@/lib/controlled-merch'
import { getProductById, getProductGallery, getCartLineKey, isPurchasable, requiresSizeSelection } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { ArtistAvatar } from '@/components/artist/ArtistAvatar'
import { resolveArtistAvatarSource } from '@/lib/artist-credits'
import { ArtistThemeBridge } from '@/components/artist/ArtistThemeBridge'
import { getArtistThemeStyles, resolveArtistAppearance } from '@/lib/artist-theme'

export function ProductDetailPage({ product: initialProduct }: { product?: any | null }) {
  const params = useParams()
  const product = initialProduct || getProductById(params.id as string)
  const { addItem } = useCart()

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  if (!product || (product.publicVisible === false && product.storeVisible === false)) {
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

  const purchasable = product.purchasable ?? isPurchasable(product)
  const controlled = product.visibilityStatus === 'controlled' || product.skuCode === CONTROLLED_MERCH.skuCode
  const appearance = resolveArtistAppearance(product.artistId || product.artist, null)

  const colors: string[] = product.colors || []
  const sizes: string[] = product.sizes || []
  const images = getProductGallery(product)
  const needsSize = requiresSizeSelection(product)
  const selectedVariantKey = getCartLineKey({
    productId: product.id,
    size: selectedSize || null,
    color: selectedColor || null,
  })
  const canAddToCart = purchasable && (!needsSize || Boolean(selectedSize))

  const handleAddToCart = () => {
    if (!canAddToCart) return
    addItem({
      productId: product.id,
      variantKey: selectedVariantKey,
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
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)] text-[var(--pf-text)]" style={getArtistThemeStyles(appearance)}>
      <ArtistThemeBridge appearance={appearance} />
      <div className="pf-container">
        <Link href="/store" className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-muted)] hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Store
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          <div data-product-gallery>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] mb-4">
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

          <div data-product-details>
            <div className="mb-2">
              <span className="text-xs uppercase tracking-wider text-[var(--pf-text-muted)]">
                {product.category} • {product.artist}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {purchasable ? (
                <>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
                    Live
                  </span>
                  {controlled && (
                    <span className="rounded-full border border-[rgba(249,115,22,0.25)] bg-[rgba(249,115,22,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pf-orange)]">
                      Controlled Drop
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
                    Preview
                  </span>
                  <span className="rounded-full border border-[var(--pf-border)] bg-[var(--pf-surface)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
                    Not live yet
                  </span>
                </>
              )}
            </div>

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

            <div className="text-4xl font-bold text-[var(--pf-orange)] mb-6">${product.price.toFixed(2)}</div>

            {product.description && (
              <p className="text-[var(--pf-text-secondary)] mb-6 leading-relaxed">{product.description}</p>
            )}

            {product.format && (
              <div className="mb-4 text-sm text-[var(--pf-text-secondary)]">
                <strong>Format:</strong> {product.format}
                {product.tracks && ` • ${product.tracks} tracks`}
              </div>
            )}

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

            {sizes.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium mb-2">Size: {selectedSize || 'Select a size'}</p>
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
                {needsSize && !selectedSize && (
                  <p className="mt-2 text-xs text-[var(--pf-text-muted)]">
                    Pick a size before adding this shirt to your cart.
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-4 flex items-center justify-center gap-2 ${
                !purchasable
                  ? 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-muted)] cursor-not-allowed'
                  : !canAddToCart
                  ? 'bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-muted)] cursor-not-allowed'
                  : added
                  ? 'bg-green-500 text-white'
                  : 'bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white shadow-lg shadow-[var(--pf-orange)]/20'
              }`}
            >
              {!purchasable ? (
                <>
                  <Clock size={20} /> Preview — Not Available Yet
                </>
              ) : !canAddToCart ? (
                <>
                  <Clock size={20} /> Choose a Size to Continue
                </>
              ) : added ? (
                <><Check size={20} /> Added to Cart</>
              ) : (
                <>Add to Cart — ${product.price.toFixed(2)}</>
              )}
            </button>

            <Link
              href={`/artist/${product.artist.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/\s+/g, '-')}`}
              className="block text-center text-sm text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] mb-4 transition-colors"
            >
              More from {product.artist} →
            </Link>

            {/* Size Guide */}
            {sizes.length > 0 && (
              <div className="mb-4 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler size={16} className="text-[var(--pf-orange)]" />
                  <span className="text-sm font-medium">Size Guide</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                    <div key={sz} className={`rounded-lg py-1.5 border ${sizes.includes(sz) ? 'border-[var(--pf-border)] bg-[var(--pf-bg)] text-[var(--pf-text)]' : 'border-transparent text-[var(--pf-text-muted)] opacity-40'}`}>
                      {sz}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[var(--pf-text-muted)] mt-2">Unisex fit. Model is 5'10" wearing size L.</p>
              </div>
            )}

            {/* Shipping Info */}
            <div className="mb-4 rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package size={16} className="text-[var(--pf-orange)]" />
                <span className="text-sm font-medium">Shipping & Delivery</span>
              </div>
              <ul className="space-y-1.5 text-xs text-[var(--pf-text-secondary)]">
                <li className="flex items-start gap-2">
                  <Truck size={12} className="mt-0.5 shrink-0 text-[var(--pf-text-muted)]" />
                  <span>Ships via USPS / UPS within 3–5 business days</span>
                </li>
                <li className="flex items-start gap-2">
                  <Info size={12} className="mt-0.5 shrink-0 text-[var(--pf-text-muted)]" />
                  <span>Free shipping on orders over $75</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield size={12} className="mt-0.5 shrink-0 text-[var(--pf-text-muted)]" />
                  <span>30-day return policy on unworn items</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[var(--pf-border)]">
              <div className="text-center">
                <Shield size={18} className="mx-auto text-green-500 mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">Secure Checkout</p>
              </div>
              <div className="text-center">
                <Heart size={18} className="mx-auto text-[var(--pf-orange)] mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">Artist-linked product</p>
              </div>
              <div className="text-center">
                <Truck size={18} className="mx-auto text-blue-400 mb-1" />
                <p className="text-xs text-[var(--pf-text-muted)]">Ships Worldwide</p>
              </div>
            </div>
          </div>
        </div>

        {/* From the Creator — Value Visibility Section */}
        <div className="mt-16 rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8">
          <div className="flex items-center gap-2 mb-6">
            <Star size={20} className="text-[var(--pf-orange)]" />
            <h2 className="text-xl font-bold text-white">From the Creator</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <ArtistAvatar
                  src={resolveArtistAvatarSource(product.artist)}
                  alt={product.artist}
                  name={product.artist}
                  size="lg"
                  className="ring-2 ring-white/10"
                />
                <div>
                  <p className="font-semibold text-white">{product.artist}</p>
                  <p className="text-sm text-[var(--pf-text-muted)]">Creator on Porterful</p>
                </div>
              </div>              <p className="text-sm text-[var(--pf-text-secondary)]">
                This {product.category?.toLowerCase() || 'product'} was created by {product.artist} and 
                is sold directly through Porterful. When you buy here, you support the creator — 
                not a marketplace middleman.
              </p>
              <Link
                href={`/artist/${product.artist.toLowerCase().replace(/\s+/g, '-')}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline"
              >
                See more from {product.artist} →
              </Link>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Related from Porterful</h3>
              <div className="grid gap-3">
                <Link href="/store" className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] p-3 transition-colors hover:border-[var(--pf-orange)]/30">
                  <div className="h-10 w-10 rounded-lg bg-[var(--pf-bg)] flex items-center justify-center">
                    <Package size={18} className="text-[var(--pf-orange)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Browse the Store</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">Discover more products</p>
                  </div>
                </Link>
                <Link href="/collections/coming-home" className="flex items-center gap-3 rounded-xl border border-[var(--pf-border)] p-3 transition-colors hover:border-[#C4956A]/30">
                  <div className="h-10 w-10 rounded-lg bg-[#C4956A]/10 flex items-center justify-center">
                    <Heart size={18} className="text-[#C4956A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Coming Home Collection™</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">Products with meaning</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
