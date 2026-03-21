'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { CreditCard, Lock, Check, DollarSign, Users, Gift, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user } = useSupabase();
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [showSupportTip, setShowSupportTip] = useState(true);
  
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '', country: 'United States',
  });

  // Demo cart
  const cartItems = [
    { id: '1', title: 'Ambiguous LP', artist: 'O D Porter', price: 25, quantity: 1, type: 'music', artistCut: 20 },
    { id: '2', title: 'Premium Tee', artist: 'O D Porter', price: 28, quantity: 2, type: 'merch', artistCut: 22.40 },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const artistCut = cartItems.reduce((sum, item) => sum + item.artistCut * item.quantity, 0);
  const platformFee = subtotal - artistCut;
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shippingCost;

  const handleSubmit = async () => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('complete');
    setProcessing(false);
  };

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
                That's {((artistCut / subtotal) * 100).toFixed(0)}% of your purchase!
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

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Progress - Simple 3-step */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {['shipping', 'payment', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                ['payment', 'review', 'complete'].includes(step) && i < ['shipping', 'payment', 'review'].indexOf(step)
                  ? 'bg-green-500 text-white'
                  : step === s 
                    ? 'bg-[var(--pf-orange)] text-white' 
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
              }`}>
                {['payment', 'review', 'complete'].includes(step) && i < ['shipping', 'payment', 'review'].indexOf(step) ? <Check size={16} /> : i + 1}
              </div>
              <span className={`hidden sm:block capitalize ${step === s ? 'text-white' : 'text-[var(--pf-text-muted)]'}`}>
                {s}
              </span>
              {i < 2 && <div className="w-8 h-px bg-[var(--pf-border)]" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                
                {/* Guest checkout option */}
                {!user && showSupportTip && (
                  <div className="bg-[var(--pf-orange)]/10 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Gift className="text-[var(--pf-orange)] shrink-0" size={20} />
                    <div>
                      <p className="font-medium text-[var(--pf-orange)]">Create an account?</p>
                      <p className="text-sm text-[var(--pf-text-secondary)]">Get 10% off your first order and support your favorite artists every time you shop.</p>
                      <Link href="/signup" className="text-sm text-[var(--pf-orange)] underline">Sign up now →</Link>
                    </div>
                    <button onClick={() => setShowSupportTip(false)} className="text-[var(--pf-text-muted)] hover:text-white">
                      ✕
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">First Name</label>
                      <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" placeholder="First" />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Last Name</label>
                      <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" placeholder="Last" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Email</label>
                    <input type="email" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" placeholder="you@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Address</label>
                    <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" placeholder="Street address" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">City</label>
                      <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">State</label>
                      <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">ZIP Code</label>
                      <input type="text" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Country</label>
                      <select className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none">
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => setStep('payment')} className="w-full pf-btn pf-btn-primary mt-6">
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                
                {/* Payment options */}
                <div className="space-y-3 mb-6">
                  <div className="bg-[var(--pf-bg)] rounded-lg p-4 flex items-center gap-4 border-2 border-[var(--pf-orange)]">
                    <CreditCard className="text-[var(--pf-orange)]" size={24} />
                    <div className="flex-1">
                      <p className="font-medium">Credit or Debit Card</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">Visa, Mastercard, Amex, Discover</p>
                    </div>
                    <Check className="text-[var(--pf-orange)]" size={20} />
                  </div>
                  
                  <div className="bg-[var(--pf-bg)] rounded-lg p-4 flex items-center gap-4 opacity-50">
                    <Zap className="text-[var(--pf-text-muted)]" size={24} />
                    <div className="flex-1">
                      <p className="font-medium text-[var(--pf-text-muted)]">Pay with PayPal</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">Coming soon</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Card Number</label>
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">CVC</label>
                      <input type="text" placeholder="123" className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-[var(--pf-text-muted)]">
                  <Lock size={14} />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep('shipping')} className="pf-btn pf-btn-secondary">Back</button>
                  <button onClick={() => setStep('review')} className="flex-1 pf-btn pf-btn-primary">Review Order</button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Review Order</h2>
                
                {/* Shipping summary */}
                <div className="bg-[var(--pf-bg)] rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-[var(--pf-text-muted)]">Ship to</p>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm">123 Main St, New Orleans, LA 70112</p>
                    </div>
                    <button onClick={() => setStep('shipping')} className="text-[var(--pf-orange)] text-sm">Edit</button>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-[var(--pf-border)] pt-4 mb-6">
                  <h3 className="text-sm text-[var(--pf-text-muted)] mb-4">Items</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between mb-3">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{item.artist} × {item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Artist earnings highlight */}
                <div className="bg-green-500/10 rounded-lg p-4 mb-6 border border-green-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-green-400" size={20} />
                      <span className="font-medium text-green-400">Artist Earnings</span>
                    </div>
                    <span className="text-xl font-bold text-green-400">${artistCut.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-[var(--pf-text-muted)] mt-1">
                    {((artistCut / subtotal) * 100).toFixed(0)}% of your purchase goes directly to artists
                  </p>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('payment')} className="pf-btn pf-btn-secondary">Back</button>
                  <button onClick={handleSubmit} disabled={processing} className="flex-1 pf-btn pf-btn-primary">
                    {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="hidden lg:block">
            <div className="pf-card p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p>{item.title}</p>
                      <p className="text-[var(--pf-text-muted)]">{item.artist} × {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
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
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Free shipping progress */}
              {subtotal < 50 && (
                <div className="mt-4 p-3 bg-[var(--pf-surface)] rounded-lg">
                  <p className="text-sm text-[var(--pf-text-muted)]">
                    Add <span className="text-[var(--pf-orange)] font-medium">${(50 - subtotal).toFixed(2)}</span> more for FREE shipping
                  </p>
                  <div className="w-full bg-[var(--pf-bg)] rounded-full h-2 mt-2">
                    <div className="bg-[var(--pf-orange)] rounded-full h-2" style={{ width: `${(subtotal / 50) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[var(--pf-text-muted)]">
                <Lock size={14} />
                <span className="text-xs">Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}