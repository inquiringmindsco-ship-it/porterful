'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { CreditCard, Lock, Check, DollarSign, Users, Music } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const { user } = useSupabase();
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [processing, setProcessing] = useState(false);
  
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  // Demo cart - in production this would come from cart context
  const cartItems = [
    { id: '1', title: 'Ambiguous LP', artist: 'O D Porter', price: 25, quantity: 1, type: 'music', artistCut: 20 },
    { id: '2', title: 'Ambiguous Tee', artist: 'O D Porter', price: 28, quantity: 2, type: 'merch', artistCut: 22.40 },
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
              <Link href="/marketplace" className="pf-btn pf-btn-primary">
                Continue Shopping
              </Link>
              <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
                View Your Library
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          {['shipping', 'payment', 'review'].map((s, i) => {
            const isCurrentStep = step === s;
            const isComplete = ['payment', 'review', 'complete'].includes(step) && i < ['shipping', 'payment', 'review'].indexOf(step);
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCurrentStep || isComplete ? 'bg-[var(--pf-orange)] text-white' : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'}`}>
                  {isComplete ? <Check size={16} /> : i + 1}
                </div>
                <span className={`hidden sm:block capitalize ${step === s ? 'text-white' : 'text-[var(--pf-text-muted)]'}`}>
                  {s}
                </span>
                {i < 2 && <div className="w-8 h-px bg-[var(--pf-border)]" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Name</label>
                    <input
                      type="text"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Email</label>
                    <input
                      type="email"
                      value={shipping.email}
                      onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Address</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">City</label>
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">State</label>
                      <input
                        type="text"
                        value={shipping.state}
                        onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">ZIP</label>
                      <input
                        type="text"
                        value={shipping.zip}
                        onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Country</label>
                      <select
                        value={shipping.country}
                        onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setStep('payment')}
                  className="w-full pf-btn pf-btn-primary mt-6"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                <div className="bg-[var(--pf-bg)] rounded-lg p-4 mb-6 flex items-center gap-3">
                  <CreditCard className="text-[var(--pf-orange)]" size={24} />
                  <div>
                    <p className="font-medium">Card Payment</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">Secure via Stripe</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">CVC</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-[var(--pf-text-muted)]">
                  <Lock size={14} />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep('shipping')} className="pf-btn pf-btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setStep('review')} className="flex-1 pf-btn pf-btn-primary">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Review Order</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm text-[var(--pf-text-muted)] mb-2">Shipping To</h3>
                    <p className="font-medium">{shipping.name}</p>
                    <p className="text-[var(--pf-text-secondary)]">{shipping.address}</p>
                    <p className="text-[var(--pf-text-secondary)]">{shipping.city}, {shipping.state} {shipping.zip}</p>
                  </div>
                </div>

                <div className="border-t border-[var(--pf-border)] pt-4 mb-6">
                  <h3 className="text-sm text-[var(--pf-text-muted)] mb-4">Items</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between mb-2">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{item.artist} x{item.quantity}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('payment')} className="pf-btn pf-btn-secondary">
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={processing}
                    className="flex-1 pf-btn pf-btn-primary"
                  >
                    {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="pf-card p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-[var(--pf-text-muted)]">{item.artist}</p>
                    </div>
                    <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
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

              <div className="mt-4 p-3 bg-[var(--pf-orange)]/10 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={16} className="text-[var(--pf-orange)]" />
                  <span className="text-sm font-medium text-[var(--pf-orange)]">Artist Earnings</span>
                </div>
                <p className="text-xl font-bold text-[var(--pf-orange)]">${artistCut.toFixed(2)}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{((artistCut / subtotal) * 100).toFixed(0)}% of purchase goes to artists</p>
              </div>

              {subtotal < 50 && (
                <p className="text-xs text-[var(--pf-text-muted)] mt-4">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}