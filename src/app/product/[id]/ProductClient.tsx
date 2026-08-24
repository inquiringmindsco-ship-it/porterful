'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, Share2, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/Toast';
import { ALL_PRODUCTS } from '@/lib/products';

export default function ProductClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const quantityRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  // Find product by ID - use ALL_PRODUCTS for full catalog (100+ products)
  const product = ALL_PRODUCTS.find(p => p.id === productId);
  
  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-6xl text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/shop" className="pf-btn pf-btn-primary">
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }
  
  // Handle product fields that may come from different sources
  const productImage = product.images?.[0] || product.image;
  const productArtist = product.artist || 'Porterful';
  const productDescription = product.description || `Premium quality ${product.subcategory?.toLowerCase() || 'merchandise'} from Porterful. 80% of proceeds go directly to independent artists.`;
  const basePrice = product.basePrice || product.price || 9.99;
  const salePrice = Math.round(basePrice * 1.3 * 100) / 100;
  const artistCut = Math.round(salePrice * 0.80 * 100) / 100;
  
  // Type guard for merch products
  const hasColors = 'colors' in product && product.colors?.length;
  const hasSizes = 'sizes' in product && product.sizes?.length;

  const handleAddToCart = () => {
    // Validate selections
    if (hasSizes && !selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (hasColors && !selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }

    addItem({
      productId: product.id,
      price: salePrice,
      name: product.name,
      artist: productArtist,
      image: productImage,
      artistCut: artistCut,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  // Check if already in cart
  const inCart = items.some(item => item.productId === product.id);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--pf-text-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--pf-orange)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-[var(--pf-orange)]">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--pf-text)]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--pf-surface)]">
            <Image 
              src={productImage}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Sold Out</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
              {productArtist !== 'Porterful' && (
                <Link 
                  href={`/artist/${productArtist.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]"
                >
                  by {productArtist}
                </Link>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={i < Math.floor(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} 
                    />
                  ))}
                </div>
                <span className="text-[var(--pf-text-secondary)]">
                  {product.rating.toFixed(1)} ({product.reviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[var(--pf-orange)]">
                ${salePrice.toFixed(2)}
              </span>
              <span className="text-sm text-[var(--pf-text-muted)]">
                ${artistCut.toFixed(2)} goes to independent artists
              </span>
            </div>

            {/* Description */}
            <p className="text-[var(--pf-text-secondary)]">{productDescription}</p>

            {/* Color Selection */}
            {hasColors && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  Color: <span className="text-[var(--pf-orange)]">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {product.colors?.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        selectedColor === color 
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10 text-[var(--pf-orange)]' 
                          : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {hasSizes && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  Size{selectedSize ? `: ${selectedSize}` : ': Select a size'}
                  {!product.inStock && <span className="text-[var(--pf-text-muted)] ml-2">(Sold Out)</span>}
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => !product.inStock || setSelectedSize(size)}
                      disabled={!product.inStock}
                      className={`w-12 h-12 rounded-lg border font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-white' 
                          : product.inStock
                            ? 'border-[var(--pf-border)] hover:border-[var(--pf-orange)] cursor-pointer'
                            : 'border-[var(--pf-border)] opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!product.inStock}
                  aria-label="Decrease quantity"
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center touch-manipulation active:scale-95 transition-all ${
                    product.inStock
                      ? 'border-[var(--pf-border)] hover:border-[var(--pf-orange)] cursor-pointer'
                      : 'border-[var(--pf-border)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <span className={`w-14 text-center font-medium text-lg ${!product.inStock ? 'opacity-50' : ''}`} aria-label={`Quantity: ${quantity}`}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={!product.inStock}
                  aria-label="Increase quantity"
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center touch-manipulation active:scale-95 transition-all ${
                    product.inStock
                      ? 'border-[var(--pf-border)] hover:border-[var(--pf-orange)] cursor-pointer'
                      : 'border-[var(--pf-border)] opacity-50 cursor-not-allowed'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>

            {/* Free Shipping Progress */}
            {product.price >= 50 ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-sm text-green-500 font-medium">🎉 You qualify for FREE shipping!</p>
              </div>
            ) : (
              <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg p-3">
                <p className="text-xs text-[var(--pf-text-muted)] mb-1.5">
                  Add <span className="text-[var(--pf-orange)] font-medium">${(50 - product.price).toFixed(2)}</span> more for FREE shipping
                </p>
                <div className="h-1.5 bg-[var(--pf-border)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--pf-orange)] rounded-full transition-all"
                    style={{ width: `${Math.min((product.price / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock || added}
                className={`flex-1 pf-btn ${added ? 'bg-green-600 hover:bg-green-700' : 'pf-btn-primary'} text-lg`}
              >
                {added ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    {product.inStock ? 'Add to Cart' : 'Sold Out'}
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className={`pf-btn text-lg px-6 ${product.inStock ? 'pf-btn-secondary' : 'opacity-50 cursor-not-allowed'}`}
              >
                {product.inStock ? 'Buy Now' : 'Unavailable'}
              </button>
            </div>

            {/* Sales Info */}
            {product.sales && (
              <p className="text-sm text-[var(--pf-text-muted)]">
                {product.sales} sold
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}