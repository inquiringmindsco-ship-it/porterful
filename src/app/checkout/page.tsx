'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react';
import { PRODUCTS } from '@/lib/data';

// Demo cart
const DEMO_CART = [
  { productId: 'ambiguous-tee', quantity: 2, size: 'L', color: 'Black' },
  { productId: 'ambiguous-vinyl', quantity: 1, size: null, color: null },
];

export default function CheckoutPage() {
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [processing, setProcessing] = useState(false);
  
  const steps: readonly ('shipping' | 'payment' | 'review')[] = ['shipping', 'payment', 'review'] as const;
  const stepIndex = steps.indexOf(step as any);
  const currentStep = steps.find(s => s === step);
  const isComplete = step === 'complete';
  
  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
  });

  const cartItems = DEMO_CART.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const artistCut = cartItems.reduce((sum, item) => {
    return sum + (item.product?.artistCut || 0) * item.quantity;
  }, 0);

  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shippingCost;

  const handleSubmit = async () => {
    setProcessing(true);
    // Simulate payment processing
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
              Thank you for your purchase. You'll receive an email confirmation shortly.
            </p>
            <div className="bg-[var(--pf-bg)] rounded-lg p-6 mb-6">
              <p className="text-sm text-[var(--pf-text-muted)] mb-2">Order Total</p>
              <p className="text-3xl font-bold">${total.toFixed(2)}</p>
              <p className="text-sm text-green-400 mt-2">
                ${artistCut.toFixed(2)} going to artists
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace" className="pf-btn pf-btn-primary">
                Continue Shopping
              </Link>
              <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
                View Dashboard
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
        {/* Back */}
        <Link href="/cart" className="flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-white mb-6">
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((s, i) => {
            const isActive = step === s || (isComplete && i === 2);
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive 
                    ? 'bg-[var(--pf-orange)] text-white' 
                    : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
                }`}>
                  {i + 1}
                </div>
                <span className={`hidden sm:block capitalize ${
                  step === s ? 'text-white' : 'text-[var(--pf-text-muted)]'
                }`}>
                  {s}
                </span>
                {i < 2 && <div className="w-8 h-px bg-[var(--pf-border)]" />}
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <input
                        type="text"
                        value={shipping.name}
                        onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={shipping.email}
                        onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={shipping.city}
                        onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={shipping.state}
                        onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={shipping.zip}
                        onChange={(e) => setShipping({ ...shipping, zip: e.target.value })}
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--pf-orange)]"
                      />
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
                <div className="bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="text-[var(--pf-orange)]" size={24} />
                    <span className="font-semibold">Credit Card</span>
                  </div>
                  <p className="text-[var(--pf-text-muted)] text-sm">
                    Payment processing will be available once Stripe is configured.
                  </p>
                  <div className="mt-4 p-4 bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-lg">
                    <p className="text-sm text-[var(--pf-orange)]">
                      🎵 This is a demo. No actual payment will be processed.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--pf-text-muted)] mb-6">
                  <Lock size={14} />
                  Your payment information is secure
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setStep('shipping')}
                    className="pf-btn pf-btn-secondary"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep('review')}
                    className="pf-btn pf-btn-primary flex-1"
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="pf-card p-6">
                <h2 className="text-xl font-bold mb-6">Review Order</h2>
                
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Shipping To</h3>
                  <p className="text-[var(--pf-text-secondary)]">
                    {shipping.name || 'Not provided'}<br />
                    {shipping.address || 'Not provided'}<br />
                    {shipping.city || ''}, {shipping.state || ''} {shipping.zip || ''}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Items</h3>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.productId} className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-[var(--pf-surface)] overflow-hidden">
                          <img 
                            src={item.product?.image}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.product?.name}</p>
                          <p className="text-sm text-[var(--pf-text-muted)]">
                            {item.size && `Size: ${item.size}`}
                            {item.color && ` • Color: ${item.color}`}
                            {' • Qty: ' + item.quantity}
                          </p>
                        </div>
                        <span className="font-bold">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[var(--pf-border)] pt-6">
                  <button 
                    onClick={handleSubmit}
                    disabled={processing}
                    className="w-full pf-btn pf-btn-primary"
                  >
                    {processing ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="pf-card p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-secondary)]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-secondary)]">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>To artists</span>
                  <span>${artistCut.toFixed(2)}</span>
                </div>
                <div className="border-t border-[var(--pf-border)] pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/30 rounded-lg p-4 text-center">
                <p className="text-sm">
                  <span className="text-[var(--pf-orange)] font-bold">${artistCut.toFixed(2)}</span>
                  <span className="text-[var(--pf-text-secondary)]"> going to artists</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}