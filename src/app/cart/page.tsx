'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, subtotal, artistCut } = useCart();
  const [referralCode, setReferralCode] = useState('');
  const [appliedReferral, setAppliedReferral] = useState(false);
  const total = subtotal + (subtotal >= 50 ? 0 : 5);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleCheckout = () => {
    // Store cart in localStorage for checkout page
    localStorage.setItem('porterful-checkout-items', JSON.stringify(items));
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="pf-card p-12 text-center">
            <ShoppingBag size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
            <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Looks like you haven't added anything yet.
            </p>
            <Link href="/marketplace" className="pf-btn pf-btn-primary">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="pf-card p-4 flex gap-4">
                  <div className="w-24 h-24 bg-[var(--pf-surface)] rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Link href={`/product/${item.productId}`} className="font-semibold hover:text-[var(--pf-orange)]">
                      {item.name}
                    </Link>
                    <p className="text-sm text-[var(--pf-text-muted)]">{item.artist}</p>
                    {item.size && (
                      <p className="text-sm text-[var(--pf-text-muted)]">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-sm text-[var(--pf-text-muted)]">Color: {item.color}</p>
                    )}
                    
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center" aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 rounded-lg border border-[var(--pf-border)] flex items-center justify-center hover:border-[var(--pf-orange)]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-[var(--pf-text-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-green-400 mt-1">
                      ${(item.artistCut * item.quantity).toFixed(2)} to artist
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="pf-card p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                {/* Referral */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Have a referral code?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      placeholder="PF-XXXXXXXX"
                      className="flex-1 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--pf-orange)]"
                    />
                    <button
                      onClick={() => referralCode.trim() && setAppliedReferral(true)}
                      className="px-4 py-2 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-lg hover:border-[var(--pf-orange)]"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedReferral && (
                    <p className="text-sm text-green-400 mt-2">
                      ✓ Referral applied! Superfan earns 5%
                    </p>
                  )}
                </div>

                {/* Line Items */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--pf-text-secondary)]">Shipping</span>
                    <span>{subtotal >= 50 ? 'Free' : '$5.00'}</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>To artists</span>
                    <span>${artistCut.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-[var(--pf-border)] pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(subtotal + (subtotal >= 50 ? 0 : 5)).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full pf-btn pf-btn-primary whitespace-nowrap"
                >
                  Proceed to Checkout
                </button>

                <Link href="/marketplace" className="block text-center text-[var(--pf-text-secondary)] hover:text-white text-sm mt-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sticky Checkout Bar */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-[var(--pf-surface)] border-t border-[var(--pf-border)] p-4 md:hidden z-50 safe-area-bottom">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-[var(--pf-text-muted)]">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                <p className="text-xl font-bold">${total.toFixed(2)}</p>
              </div>
              <button
                onClick={handleCheckout}
                className="pf-btn pf-btn-primary whitespace-nowrap px-6"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}