'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, Heart, Share2, ShoppingCart, Check } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/components/Toast';

export default function ProductClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { addItem, items } = useCart();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const quantityRef = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  // Find product by ID
  const product = PRODUCTS.find(p => p.id === productId);
  
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
          <Link href="/marketplace" className="hover:text-[var(--pf-orange)]">Marketplace</Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--pf-text)]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--pf-surface)]">
            <img 
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
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
              <Link 
                href={`/artist/${product.artist.toLowerCase().replace(/\s+/g, '-')}`}
                className="text-lg text-[var(--pf-text-secondary)] hover:text-[var(--pf-orange)]"
              >
                by {product.artist}
              </Link>
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
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-[var(--pf-orange)]">
                ${product.price}
              </span>
              {product.artistCut && (
                <span className="text-sm text-[var(--pf-text-muted)]">
                  ${product.artistCut} goes to {product.artist}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-[var(--pf-text-secondary)]">{product.description}</p>

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
                  Size: <span className="text-[var(--pf-orange)]">{selectedSize}</span>
                </label>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes?.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border font-medium transition-all ${
                        selectedSize === size 
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)] text-white' 
                          : 'border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
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
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)]"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)]"
                >
                  +
                </button>
              </div>
            </div>

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
                className="pf-btn pf-btn-secondary text-lg px-6"
              >
                Buy Now
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