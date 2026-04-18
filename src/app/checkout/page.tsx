'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/app/providers';
import { CreditCard, Lock, Check, DollarSign, Users, Gift, Zap, ShoppingCart, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';

interface CartItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  name: string;
  artist: string;
  image: string;
  artistCut: number;
}

export default function CheckoutPage() {
  const { user } = useSupabase();
  const { items: cartContextItems, clearCart } = useCart();
  const [step, setStep] = useState<'review' | 'complete'>('review');
  const [processing, setProcessing] = useState(false);
  const [showSupportTip, setShowSupportTip] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '', country: 'US',
  });
  const [shippingErrors, setShippingErrors] = useState<Record<string, string>>({});

  // Load cart items from context or localStorage
  useEffect(() => {
    if (cartContextItems && cartContextItems.length > 0) {
      setCartItems(cartContextItems);
    } else {
      const saved = localStorage.getItem('porterful-checkout-items');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    }
  }, [cartContextItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const artistCut = cartItems.reduce((sum, item) => sum + item.artistCut * item.quantity, 0);
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shippingCost;

  const handleFinalSubmit = async () => {
    // Validate shipping
    const newErrors: Record<string, string> = {};
    if (!shipping.name.trim() || shipping.name.trim().length < 2) newErrors.name = 'Enter your full name';
    if (!shipping.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) newErrors.email = 'Enter a valid email';
    if (!shipping.address.trim()) newErrors.address = 'Address is required';
    if (!shipping.city.trim()) newErrors.city = 'City is required';
    if (!shipping.state.trim()) newErrors.state = 'State is required';
    if (!shipping.zip.trim()) newErrors.zip = 'ZIP is required';
    
    if (Object.keys(newErrors).length > 0) {
      setShippingErrors(newErrors);
      return;
    }

    setProcessing(true);
    
    try {
      const stripeItems = cartItems.map(item => ({
        id: item.productId,
        name: item.name,
        artist: item.artist,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        artistCut: item.artistCut,
        type: 'product',
        color: item.color,
        size: item.size,
      }));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: stripeItems,
          shippingEmail: shipping.email,
          referralCode: null,
        }),
      });

      const data = await response.json();

      if (data.url) {
        if (data.demo) {
          // Demo mode — simulate success
          await new Promise(resolve => setTimeout(resolve, 1500));
          clearCart();
          localStorage.removeItem('porterful-checkout-items');
          setStep('complete');
        } else {
          // Real Stripe checkout — redirect
          window.location.href = data.url;
        }
      } else {
        throw new Error(data.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed. Please try again.');
    }
    
    setProcessing(false);
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="pf-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="text-green-400" size={40} />
            </div>
            <h1 className="text-3xl font-bold mb-4">Order Complete!</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Thank you for supporting independent artists.
            </p>
            
            <div className="bg-[var(--pf-bg)] rounded-lg p-6 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-[var(--pf-text-muted)]">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-[var(--pf-text-muted)]">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--pf-border)]">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-[var(--pf-orange)]/10 rounded-lg p-4 mb-6">
              <p className="text-[var(--pf-orange)] font-semibold flex items-center justify-center gap-2">
                <DollarSign size={20} />
                ${artistCut.toFixed(2)} going directly to artists
              </p>
              <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                That's {subtotal > 0 ? ((artistCut / subtotal) * 100).toFixed(0) : 0}% of your purchase!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace" className="pf-btn pf-btn-primary">Continue Shopping</Link>
              <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">View Your Library</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="pf-card p-12 text-center">
            <ShoppingCart size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">Add some items before checking out.</p>
            <Link href="/marketplace" className="pf-btn pf-btn-primary">Browse Store</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--pf-orange)] text-white">1</div>
            <span className="hidden sm:block text-white font-medium">Review Order</span>
          </div>
          <div className="w-8 h-px bg-[var(--pf-border)]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-[var(--pf-surface)] text-[var(--pf-text-muted)]">2</div>
            <span className="hidden sm:block text-[var(--pf-text-muted)]">Stripe Checkout</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="pf-card p-6">
              <h2 className="text-xl font-bold mb-6">Review & Pay</h2>
              
              {/* Guest account nudge */}
              {!user && showSupportTip && (
                <div className="bg-[var(--pf-orange)]/10 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <Gift className="text-[var(--pf-orange)] shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="font-medium text-[var(--pf-orange)]">Create a free account?</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">Get 10% off your first order and track your orders.</p>
                    <Link href="/signup" className="text-sm text-[var(--pf-orange)] underline">Sign up →</Link>
                  </div>
                  <button onClick={() => setShowSupportTip(false)} className="text-[var(--pf-text-muted)] hover:text-white ml-auto">✕</button>
                </div>
              )}

              {/* Shipping info (prefill for Stripe) */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-sm text-[var(--pf-text-muted)] uppercase tracking-wider">Contact</h3>
                <div>
                  <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Email</label>
                  <input 
                    type="email" 
                    autoComplete="email"
                    className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                      shippingErrors.email ? 'border-red-500' : 'border-[var(--pf-border)]'
                    }`}
                    placeholder="you@email.com"
                    value={shipping.email}
                    onChange={(e) => {
                      setShipping(s => ({ ...s, email: e.target.value }));
                      if (shippingErrors.email) setShippingErrors(pv => ({ ...pv, email: '' }));
                    }}
                  />
                  {shippingErrors.email && <p className="text-red-400 text-xs mt-1">{shippingErrors.email}</p>}
                </div>

                <h3 className="font-semibold text-sm text-[var(--pf-text-muted)] uppercase tracking-wider pt-4">Shipping</h3>
                <div>
                  <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Full Name</label>
                  <input 
                    type="text" 
                    autoComplete="name"
                    className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                      shippingErrors.name ? 'border-red-500' : 'border-[var(--pf-border)]'
                    }`}
                    placeholder="John Smith"
                    value={shipping.name}
                    onChange={(e) => {
                      setShipping(s => ({ ...s, name: e.target.value }));
                      if (shippingErrors.name) setShippingErrors(pv => ({ ...pv, name: '' }));
                    }}
                  />
                  {shippingErrors.name && <p className="text-red-400 text-xs mt-1">{shippingErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Address</label>
                  <input 
                    type="text" 
                    autoComplete="street-address"
                    className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                      shippingErrors.address ? 'border-red-500' : 'border-[var(--pf-border)]'
                    }`}
                    placeholder="123 Main St"
                    value={shipping.address}
                    onChange={(e) => {
                      setShipping(s => ({ ...s, address: e.target.value }));
                      if (shippingErrors.address) setShippingErrors(pv => ({ ...pv, address: '' }));
                    }}
                  />
                  {shippingErrors.address && <p className="text-red-400 text-xs mt-1">{shippingErrors.address}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">City</label>
                    <input 
                      type="text" 
                      autoComplete="address-level2"
                      className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                        shippingErrors.city ? 'border-red-500' : 'border-[var(--pf-border)]'
                      }`}
                      value={shipping.city}
                      onChange={(e) => {
                        setShipping(s => ({ ...s, city: e.target.value }));
                        if (shippingErrors.city) setShippingErrors(pv => ({ ...pv, city: '' }));
                      }}
                    />
                    {shippingErrors.city && <p className="text-red-400 text-xs mt-1">{shippingErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">State</label>
                    <input 
                      type="text" 
                      autoComplete="address-level1"
                      className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                        shippingErrors.state ? 'border-red-500' : 'border-[var(--pf-border)]'
                      }`}
                      placeholder="MO"
                      value={shipping.state}
                      onChange={(e) => {
                        setShipping(s => ({ ...s, state: e.target.value }));
                        if (shippingErrors.state) setShippingErrors(pv => ({ ...pv, state: '' }));
                      }}
                    />
                    {shippingErrors.state && <p className="text-red-400 text-xs mt-1">{shippingErrors.state}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">ZIP Code</label>
                    <input 
                      type="text" 
                      autoComplete="postal-code"
                      inputMode="numeric"
                      className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)] ${
                        shippingErrors.zip ? 'border-red-500' : 'border-[var(--pf-border)]'
                      }`}
                      placeholder="63101"
                      value={shipping.zip}
                      onChange={(e) => {
                        setShipping(s => ({ ...s, zip: e.target.value }));
                        if (shippingErrors.zip) setShippingErrors(pv => ({ ...pv, zip: '' }));
                      }}
                    />
                    {shippingErrors.zip && <p className="text-red-400 text-xs mt-1">{shippingErrors.zip}</p>}
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Country</label>
                    <select 
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      value={shipping.country}
                      onChange={(e) => setShipping(s => ({ ...s, country: e.target.value }))}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              <div className="border-t border-[var(--pf-border)] pt-4 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="text-[var(--pf-orange)]" size={22} />
                  <div>
                    <p className="font-semibold">Secure payment via Stripe</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">You'll enter your card details on the next page</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleFinalSubmit} 
                disabled={processing}
                className="w-full py-4 rounded-xl font-bold text-lg bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white shadow-lg shadow-[var(--pf-orange)]/20 transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  'Redirecting to checkout...'
                ) : (
                  <>
                    <Lock size={18} />
                    Pay ${total.toFixed(2)} Securely with Stripe
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-[var(--pf-text-muted)]">
                <Lock size={12} />
                <span>256-bit SSL encryption • Powered by Stripe</span>
              </div>

              {/* Order items summary */}
              <div className="border-t border-[var(--pf-border)] pt-4 mt-6">
                <h3 className="text-sm font-semibold text-[var(--pf-text-muted)] uppercase tracking-wider mb-3">Items</h3>
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between mb-2 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-[var(--pf-text-muted)]">{item.artist} × {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="pf-card p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="w-12 h-12 bg-[var(--pf-surface)] rounded-lg overflow-hidden shrink-0 relative">
                      <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      <span className="absolute -top-1 -right-1 bg-[var(--pf-orange)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{item.artist}</p>
                    </div>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--pf-border)] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--pf-text-muted)]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--pf-text-muted)]">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-green-400">FREE</span> : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>To Artists</span>
                  <span>${artistCut.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[var(--pf-border)]">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-[var(--pf-surface)] rounded-lg">
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    Add <span className="text-[var(--pf-orange)] font-medium">${(50 - subtotal).toFixed(2)}</span> more for FREE shipping
                  </p>
                  <div className="w-full bg-[var(--pf-bg)] rounded-full h-2 mt-2">
                    <div className="bg-[var(--pf-orange)] rounded-full h-2 transition-all" style={{ width: `${Math.min((subtotal / 50) * 100, 100)}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
