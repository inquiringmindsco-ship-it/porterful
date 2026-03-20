'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, Heart, Share2 } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [quantity, setQuantity] = useState(1);

  // Find product by ID
  const product = PRODUCTS.find(p => p.id === params.id) || PRODUCTS[0];
  
  // Type guard for merch products
  const hasColors = 'colors' in product;
  const hasSizes = 'sizes' in product;

  const handleAddToCart = () => {
    alert(`Added ${quantity}x ${product.name} to cart!`);
  };

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
          <div className="aspect-square bg-[var(--pf-surface)] rounded-2xl overflow-hidden">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Artist/Brand */}
            <Link 
              href={product.artist ? `/artist/od-porter` : '#'}
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden">
                {product.artist ? (
                  <img src="https://images.unsplash.com/photo-1493225457124-a3eb1614b109?w=100" alt={product.artist} className="w-full h-full object-cover" />
                ) : (
                  product.brand?.[0] || '?'
                )}
              </div>
              <div>
                <span className="text-[var(--pf-text-secondary)]">by </span>
                <span className="font-medium hover:text-[var(--pf-orange)]">{product.artist || product.brand}</span>
              </div>
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-[var(--pf-text-muted)] mb-4">{product.type}</p>
            
            {/* Price & Rating */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold">${product.price}</span>
              <div className="flex items-center gap-1">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-[var(--pf-text-muted)]">({product.reviews} reviews)</span>
              </div>
            </div>

            {/* Artist Cut */}
            <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-lg p-4 mb-6">
              <p className="text-sm">
                <span className="text-[var(--pf-orange)] font-bold">${(product.artistCut).toFixed(2)}</span>
                <span className="text-[var(--pf-text-secondary)]"> goes to {product.artist ? 'the artist' : 'artists'}</span>
              </p>
            </div>

            {/* Description */}
            <p className="text-[var(--pf-text-secondary)] mb-6">{product.description}</p>

            {/* Colors */}
            {hasColors && (
              <div className="mb-6">
                <label className="block font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {(product as any).colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
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
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div className="mb-6">
                <label className="block font-medium mb-2">Size</label>
                <div className="flex gap-2">
                  {(product as any).sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
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
            <div className="mb-6">
              <label className="block font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)]"
                >
                  -
                </button>
                <span className="w-12 text-center text-xl font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="w-full pf-btn pf-btn-primary text-lg py-4 mb-4"
            >
              Add to Cart • ${(product.price * quantity).toFixed(2)}
            </button>

            {/* Actions */}
            <div className="flex gap-4">
              <button className="flex-1 pf-btn pf-btn-secondary flex items-center justify-center gap-2">
                <Heart size={18} />
                Save
              </button>
              <button className="flex-1 pf-btn pf-btn-secondary flex items-center justify-center gap-2">
                <Share2 size={18} />
                Share
              </button>
            </div>

            {/* Features */}
            {'features' in product && (
              <div className="mt-6 pt-6 border-t border-[var(--pf-border)]">
                <h3 className="font-medium mb-2">Features</h3>
                <ul className="space-y-1">
                  {(product as any).features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-[var(--pf-text-secondary)]">
                      <span className="text-green-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}