'use client';

import { useState } from 'react';
import Link from 'next/link';

// Placeholder product data
const placeholderProduct = {
  id: 'product-1',
  name: 'Essential Tee',
  price: 35,
  description: 'Premium cotton t-shirt with minimalist design. Comfortable fit, built to last.',
  artist: {
    name: 'O D Porter',
    id: 'artist-placeholder',
  },
  images: ['/placeholder-product.jpg'],
  sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  colors: ['Black', 'White', 'Orange'],
  inStock: true,
  type: 'merch',
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    // Will integrate with cart system
    alert(`Added to cart: ${quantity}x ${placeholderProduct.name} (${selectedSize}, ${selectedColor})`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{placeholderProduct.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-[#1a1a1a] rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-9xl opacity-50">👕</div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Artist */}
            <Link 
              href={`/artist/${placeholderProduct.artist.id}`}
              className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-[#ff6b00]/20 flex items-center justify-center text-sm font-bold">
                {placeholderProduct.artist.name.charAt(0)}
              </div>
              <span className="text-gray-400">by {placeholderProduct.artist.name}</span>
            </Link>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-2">{placeholderProduct.name}</h1>
            <p className="text-3xl font-bold text-[#ff6b00] mb-6">${placeholderProduct.price}</p>

            {/* Description */}
            <p className="text-gray-400 mb-8">{placeholderProduct.description}</p>

            {/* Size */}
            <div className="mb-6">
              <label className="block font-semibold mb-3">Size</label>
              <div className="flex gap-2">
                {placeholderProduct.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedSize === size
                        ? 'border-[#ff6b00] bg-[#ff6b00]/20 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block font-semibold mb-3">Color</label>
              <div className="flex gap-2">
                {placeholderProduct.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedColor === color
                        ? 'border-[#ff6b00] bg-[#ff6b00]/20 text-white'
                        : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block font-semibold mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
                >
                  -
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !placeholderProduct.inStock}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                !selectedSize || !placeholderProduct.inStock
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-[#ff6b00] text-white hover:bg-[#ff8533]'
              }`}
            >
              {!selectedSize ? 'Select a size' : !placeholderProduct.inStock ? 'Out of stock' : 'Add to Cart'}
            </button>

            {/* Referral notice */}
            <div className="mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <p className="text-sm text-gray-400">
                💜 <span className="text-white">Superfans earn 5%</span> when you shop using a referral code. Support artists you love.
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold mb-2">🚚 Shipping</h3>
            <p className="text-gray-400 text-sm">
              Ships within 3-5 business days. Free shipping on orders over $50.
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold mb-2">↩️ Returns</h3>
            <p className="text-gray-400 text-sm">
              30-day return policy. Contact support for exchanges.
            </p>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800">
            <h3 className="font-semibold mb-2">💎 Artist Revenue</h3>
            <p className="text-gray-400 text-sm">
              Artist keeps 80% of this sale. Your support matters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}