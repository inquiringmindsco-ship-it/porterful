'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, Share2, ShoppingCart, Check } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/Toast';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const quantityRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  // Find product by ID
  const product = PRODUCTS.find(p => p.id === params.id);
  
  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-6xl text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link href="/marketplace" className="pf-btn pf-btn-primary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    );
  }
  
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
      price: product.price,
      name: product.name,
      artist: product.artist,
      image: product.image,
      artistCut: product.artistCut,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
    });

    setAdded(true);
    showToast(`${product.name} added to cart!`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  const isInCart = items.some(i => i.productId === product.id);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-6xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--pf-text-muted)] mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/marketplace" className="hover:text-white transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-[var(--pf-surface)] rounded-2xl overflow-hidden sticky top-24 relative">
            <Image 
              src={product.image} 
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {product.category === 'music' && (
              <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                🎵 Music
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Artist/Brand */}
            {product.artist && (
              <Link 
                href="/artist/od-porter"
                className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1493225457124-a3eb1614b109?w=100" alt={`${product.artist} profile photo`} fill sizes="48px" className="object-cover" />
                </div>
                <div>
                  <span className="text-[var(--pf-text-secondary)]">by </span>
                  <span className="font-medium hover:text-[var(--pf-orange)]">{product.artist}</span>
                </div>
              </Link>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-[var(--pf-text-muted)] mb-4">{product.type || product.category}</p>
            
            {/* Price & Rating */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold">${product.price}</span>
              {product.rating && (
                <div className="flex items-center gap-1">
                  <Star size={18} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  {product.reviews && <span className="text-[var(--pf-text-muted)]">({product.reviews})</span>}
                </div>
              )}
            </div>

            {/* Artist Cut */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm">
                <span className="text-green-400 font-bold">${(product.artistCut).toFixed(2)}</span>
                <span className="text-[var(--pf-text-secondary)]"> goes to {product.artist ? 'the artist' : 'artists'}</span>
              </p>
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                That's {Math.round((product.artistCut / product.price) * 100)}% of your purchase
              </p>
            </div>

            {/* Description */}
            <p className="text-[var(--pf-text-secondary)] mb-6">{product.description}</p>

            {/* Colors */}
            {hasColors && product.colors && (
              <fieldset className="mb-6">
                <legend className="block font-medium mb-2">
                  Color: <span className="text-[var(--pf-text-muted)]">{selectedColor || 'Select one'}</span>
                </legend>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Select color">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      aria-label={`Select ${color} color`}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedColor === color
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                          : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Sizes */}
            {hasSizes && product.sizes && (
              <fieldset className="mb-6">
                <legend className="block font-medium mb-2">
                  Size: <span className="text-[var(--pf-text-muted)]">{selectedSize || 'Select one'}</span>
                </legend>
                <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Select size">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={selectedSize === size}
                      aria-label={`Select ${size} size`}
                      className={`w-12 h-12 rounded-lg border transition-colors font-medium ${
                        selectedSize === size
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                          : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label id="quantity-label" className="block font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4" role="group" aria-labelledby="quantity-label">
                <button
                  id="quantity-decrease"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)] text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <output
                  htmlFor="quantity-decrease quantity-increase"
                  aria-live="polite"
                  className="w-12 text-center text-xl font-bold"
                >
                  {quantity}
                </output>
                <button
                  id="quantity-increase"
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)] text-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4 mb-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 pf-btn text-lg py-4 flex items-center justify-center gap-2 ${
                  added 
                    ? 'bg-green-500 text-white' 
                    : 'pf-btn-primary'
                }`}
              >
                {added ? (
                  <>
                    <Check size={20} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="pf-btn bg-[var(--pf-orange)] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[var(--pf-orange)]/80"
              >
                Buy Now
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-6">
              <button className="flex-1 pf-btn pf-btn-secondary flex items-center justify-center gap-2">
                <Heart size={18} />
                Save
              </button>
              <button className="flex-1 pf-btn pf-btn-secondary flex items-center justify-center gap-2">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* Shipping Info */}
            <div className="bg-[var(--pf-surface)] rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-green-400">🚚</span>
                <span className="font-medium">Free shipping on orders $50+</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-400">⚡</span>
                <span className="font-medium">Ships within 3-5 business days</span>
              </div>
            </div>

            {/* In Stock */}
            <p className="text-sm text-green-400">
              ✓ In Stock - {product.sales || 100}+ sold
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}