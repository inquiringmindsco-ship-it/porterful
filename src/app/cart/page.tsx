'use client';

import { useState } from 'react';
import Link from 'next/link';

// Placeholder cart data
const placeholderCart = [
  {
    id: 'cart-1',
    product: { id: 'product-1', name: 'Essential Tee', price: 35, image: '/placeholder-product.jpg' },
    artist: { name: 'O D Porter', id: 'artist-1' },
    size: 'L',
    color: 'Black',
    quantity: 2,
  },
  {
    id: 'cart-2',
    product: { id: 'product-2', name: 'Limited Hoodie', price: 75, image: '/placeholder-product.jpg' },
    artist: { name: 'O D Porter', id: 'artist-1' },
    size: 'M',
    color: 'Orange',
    quantity: 1,
  },
];

export default function CartPage() {
  const [cart, setCart] = useState(placeholderCart);
  const [referralCode, setReferralCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = appliedCode ? subtotal * 0.1 : 0; // 10% discount for demo
  const total = subtotal - discount;

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const applyReferral = () => {
    if (referralCode.trim()) {
      setAppliedCode(referralCode);
      setReferralCode('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added anything yet.</p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#ff6b00] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#ff8533] transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-[#1a1a1a] rounded-xl p-4 flex gap-4 border border-gray-800"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-[#ff6b00]/10 rounded-lg flex items-center justify-center text-4xl">
                    👕
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <Link 
                      href={`/product/${item.product.id}`}
                      className="font-semibold hover:text-[#ff6b00] transition-colors"
                    >
                      {item.product.name}
                    </Link>
                    <Link 
                      href={`/artist/${item.artist.id}`}
                      className="block text-sm text-gray-500 hover:text-gray-400 transition-colors"
                    >
                      by {item.artist.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.size} / {item.color}
                    </p>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-gray-700 flex items-center justify-center hover:border-gray-500 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right">
                    <p className="text-xl font-bold">${item.product.price * item.quantity}</p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-gray-500 hover:text-red-400 transition-colors mt-2"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                {/* Referral Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Have a referral code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="PF-XXXXXXXX"
                      className="flex-1 bg-[#0a0a0a] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-[#ff6b00] transition-colors"
                    />
                    <button
                      onClick={applyReferral}
                      className="bg-gray-700 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCode && (
                    <p className="text-green-400 text-sm mt-2">
                      ✓ Code {appliedCode} applied! Superfan earns 5%
                    </p>
                  )}
                </div>

                {/* Line Items */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>{subtotal >= 50 ? 'Free' : '$5.00'}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(total + (subtotal >= 50 ? 0 : 5)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout */}
                <button className="w-full bg-[#ff6b00] text-white py-4 rounded-lg font-semibold mt-6 hover:bg-[#ff8533] transition-colors">
                  Proceed to Checkout
                </button>

                {/* Artist Support */}
                <div className="mt-6 p-4 bg-[#ff6b00]/10 rounded-lg border border-[#ff6b00]/30">
                  <p className="text-sm text-center">
                    💜 <span className="font-semibold">${(subtotal * 0.8).toFixed(2)}</span> goes directly to artists
                  </p>
                </div>

                {/* Continue Shopping */}
                <Link 
                  href="/shop"
                  className="block text-center text-gray-400 hover:text-white mt-4 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}