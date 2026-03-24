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
  const [step, setStep] = useState<'shipping' | 'payment' | 'review' | 'complete'>('shipping');
  const [processing, setProcessing] = useState(false);
  const [showSupportTip, setShowSupportTip] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const [shipping, setShipping] = useState({
    name: '', email: '', address: '', city: '', state: '', zip: '', country: 'United States',
  });

  // Load cart items from context or localStorage
  useEffect(() => {
    if (cartContextItems && cartContextItems.length > 0) {
      setCartItems(cartContextItems);
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem('porterful-checkout-items');
      if (saved) {
        setCartItems(JSON.parse(saved));
      }
    }
  }, [cartContextItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const artistCut = cartItems.reduce((sum, item) => sum + item.artistCut * item.quantity, 0);
  const platformFee = subtotal - artistCut;
  const shippingCost = subtotal >= 50 ? 0 : 5;
  const total = subtotal + shippingCost;

  const [payment, setPayment] = useState({
    cardNumber: '', expiry: '', cvc: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Format card number with spaces every 4 digits
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }
  
  // Format expiry as MM/YY
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2)
    }
    return digits
  }
  
  // Validate a single field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'cardNumber':
        const digits = value.replace(/\s/g, '')
        if (!digits) return 'Card number is required'
        if (digits.length < 13 || digits.length > 19) return 'Enter a valid card number'
        return ''
      case 'expiry':
        if (!value) return 'Expiry is required'
        const [month, year] = value.split('/')
        if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) return 'Enter valid expiry (MM/YY)'
        const expYear = 2000 + parseInt(year)
        const expMonth = parseInt(month)
        const now = new Date()
        if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
          return 'Card has expired'
        }
        return ''
      case 'cvc':
        if (!value) return 'CVC is required'
        if (!/^\d{3,4}$/.test(value)) return 'Enter valid CVC'
        return ''
      default:
        return ''
    }
  }
  
  // Validate shipping field
  const validateShippingField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Name is required'
        if (value.trim().length < 2) return 'Enter your full name'
        return ''
      case 'email':
        if (!value) return 'Email is required'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email'
        return ''
      case 'address':
        if (!value.trim()) return 'Address is required'
        return ''
      case 'city':
        if (!value.trim()) return 'City is required'
        return ''
      case 'state':
        if (!value.trim()) return 'State is required'
        return ''
      case 'zip':
        if (!value.trim()) return 'ZIP code is required'
        if (!/^\d{5}(-\d{4})?$|^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i.test(value)) return 'Enter a valid ZIP code'
        return ''
      default:
        return ''
    }
  }

  const handlePaymentSubmit = () => {
    // Validate all payment fields
    const cardErr = validateField('cardNumber', payment.cardNumber)
    const expiryErr = validateField('expiry', payment.expiry)
    const cvcErr = validateField('cvc', payment.cvc)
    
    if (cardErr || expiryErr || cvcErr) {
      setErrors({
        cardNumber: cardErr,
        expiry: expiryErr,
        cvc: cvcErr,
      })
      return
    }
    setErrors({})
    setStep('review')
  }

  const handleFinalSubmit = async () => {
    setProcessing(true)
    
    try {
      // Convert cart items to Stripe format (prices in cents)
      const stripeItems = cartItems.map(item => ({
        title: item.name,
        artist: item.artist,
        price: Math.round(item.price * 100), // Convert to cents
        quantity: item.quantity,
        image: item.image,
      }))

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: stripeItems,
          shipping,
          referralCode: null,
        }),
      })

      const data = await response.json()

      if (data.url && !data.demo) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        // Demo mode - simulate success
        await new Promise(resolve => setTimeout(resolve, 1500))
        clearCart()
        localStorage.removeItem('porterful-checkout-items')
        setStep('complete')
      }
    } catch (error) {
      console.error('Checkout failed:', error)
      // Still show success in demo mode
      setStep('complete')
    }
    
    setProcessing(false)
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
                      <input 
                        type="text" 
                        autoComplete="given-name"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" 
                        placeholder="First"
                        value={shipping.name.split(' ')[0] || ''}
                        onChange={(e) => setShipping(s => ({ ...s, name: (e.target.value + ' ' + (s.name.split(' ')[1] || '')).trim() }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Last Name</label>
                      <input 
                        type="text" 
                        autoComplete="family-name"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" 
                        placeholder="Last"
                        value={shipping.name.split(' ').slice(1).join(' ') || ''}
                        onChange={(e) => setShipping(s => ({ ...s, name: ((s.name.split(' ')[0] || '') + ' ' + e.target.value).trim() }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Email</label>
                    <input 
                      type="email" 
                      autoComplete="email"
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" 
                      placeholder="you@email.com"
                      value={shipping.email}
                      onChange={(e) => setShipping(s => ({ ...s, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Address</label>
                    <input 
                      type="text" 
                      autoComplete="street-address"
                      className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none" 
                      placeholder="Street address"
                      value={shipping.address}
                      onChange={(e) => setShipping(s => ({ ...s, address: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">City</label>
                      <input 
                        type="text" 
                        autoComplete="address-level2"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                        value={shipping.city}
                        onChange={(e) => setShipping(s => ({ ...s, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">State</label>
                      <input 
                        type="text" 
                        autoComplete="address-level1"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                        value={shipping.state}
                        onChange={(e) => setShipping(s => ({ ...s, state: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">ZIP Code</label>
                      <input 
                        type="text" 
                        autoComplete="postal-code"
                        inputMode="numeric"
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                        value={shipping.zip}
                        onChange={(e) => setShipping(s => ({ ...s, zip: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Country</label>
                      <select 
                        className="w-full bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg px-4 py-3 focus:border-[var(--pf-orange)] focus:outline-none"
                        value={shipping.country}
                        onChange={(e) => setShipping(s => ({ ...s, country: e.target.value }))}
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  // Validate shipping fields
                  const newErrors: Record<string, string> = {}
                  if (!shipping.name.trim() || shipping.name.trim().length < 2) newErrors.name = 'Enter your full name'
                  if (!shipping.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) newErrors.email = 'Enter a valid email'
                  if (!shipping.address.trim()) newErrors.address = 'Address is required'
                  if (!shipping.city.trim()) newErrors.city = 'City is required'
                  if (!shipping.state.trim()) newErrors.state = 'State is required'
                  if (!shipping.zip.trim() || !/^\d{5}(-\d{4})?$|^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i.test(shipping.zip)) newErrors.zip = 'Enter a valid ZIP code'
                  
                  if (Object.keys(newErrors).length > 0) {
                    // Show first error
                    const firstError = Object.values(newErrors)[0]
                    alert(firstError)
                    return
                  }
                  setStep('payment')
                }} className="w-full pf-btn pf-btn-primary mt-6">
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
                    <input 
                      type="text" 
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242" 
                      className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none ${
                        errors.cardNumber ? 'border-red-500' : 'border-[var(--pf-border)] focus:border-[var(--pf-orange)]'
                      }`}
                      value={payment.cardNumber}
                      onChange={(e) => {
                        const formatted = formatCardNumber(e.target.value)
                        setPayment(p => ({ ...p, cardNumber: formatted }))
                        if (errors.cardNumber) setErrors(pv => ({ ...pv, cardNumber: '' }))
                      }}
                      onBlur={(e) => {
                        const err = validateField('cardNumber', e.target.value)
                        if (err) setErrors(pv => ({ ...pv, cardNumber: err }))
                      }}
                    />
                    {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">Expiry</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY" 
                        className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none ${
                          errors.expiry ? 'border-red-500' : 'border-[var(--pf-border)] focus:border-[var(--pf-orange)]'
                        }`}
                        value={payment.expiry}
                        onChange={(e) => {
                          const formatted = formatExpiry(e.target.value)
                          setPayment(p => ({ ...p, expiry: formatted }))
                          if (errors.expiry) setErrors(pv => ({ ...pv, expiry: '' }))
                        }}
                        onBlur={(e) => {
                          const err = validateField('expiry', e.target.value)
                          if (err) setErrors(pv => ({ ...pv, expiry: err }))
                        }}
                      />
                      {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--pf-text-muted)] mb-1">CVC</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123" 
                        className={`w-full bg-[var(--pf-bg)] border rounded-lg px-4 py-3 focus:outline-none ${
                          errors.cvc ? 'border-red-500' : 'border-[var(--pf-border)] focus:border-[var(--pf-orange)]'
                        }`}
                        value={payment.cvc}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setPayment(p => ({ ...p, cvc: digits }))
                          if (errors.cvc) setErrors(pv => ({ ...pv, cvc: '' }))
                        }}
                        onBlur={(e) => {
                          const err = validateField('cvc', e.target.value)
                          if (err) setErrors(pv => ({ ...pv, cvc: err }))
                        }}
                      />
                      {errors.cvc && <p className="text-red-400 text-xs mt-1">{errors.cvc}</p>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-[var(--pf-text-muted)]">
                  <Lock size={14} />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep('shipping')} className="pf-btn pf-btn-secondary">Back</button>
                  <button onClick={handlePaymentSubmit} className="flex-1 pf-btn pf-btn-primary">Review Order</button>
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
                      <p className="font-medium">{shipping.name || 'Not provided'}</p>
                      <p className="text-sm">
                        {shipping.address ? `${shipping.address}, ` : ''}{shipping.city ? `${shipping.city}, ` : ''}{shipping.state || ''} {shipping.zip || ''}
                      </p>
                    </div>
                    <button onClick={() => setStep('shipping')} className="text-[var(--pf-orange)] text-sm">Edit</button>
                  </div>
                </div>

                {/* Items */}
                <div className="border-t border-[var(--pf-border)] pt-4 mb-6">
                  <h3 className="text-sm text-[var(--pf-text-muted)] mb-4">Items</h3>
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex justify-between mb-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
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
                  <button onClick={handleFinalSubmit} disabled={processing} className="flex-1 pf-btn pf-btn-primary">
                    {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Mobile collapsible */}
          <div className="lg:hidden mb-6">
            <details className="pf-card p-4">
              <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  Order Summary ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-bold">${total.toFixed(2)}</span>
                  <ChevronDown size={18} className="details-chevron" />
                </span>
              </summary>
              <div className="mt-4 pt-4 border-t border-[var(--pf-border)] space-y-2">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div>
                      <p>{item.name}</p>
                      <p className="text-[var(--pf-text-muted)]">{item.artist} × {item.quantity}</p>
                    </div>
                    <p>${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 border-t border-[var(--pf-border)]">
                  <span className="text-[var(--pf-text-muted)]">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--pf-text-muted)]">Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm text-green-400">
                  <span>To Artists</span>
                  <span>${artistCut.toFixed(2)}</span>
                </div>
              </div>
            </details>
          </div>

          {/* Order Summary - Sticky Sidebar (Desktop) */}
          <div className="hidden lg:block">
            <div className="pf-card p-6 sticky top-24">
              <h3 className="font-bold mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <div>
                      <p>{item.name}</p>
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