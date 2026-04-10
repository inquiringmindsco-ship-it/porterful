'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Download, Mail, Music, Package, ArrowRight } from 'lucide-react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const demo = searchParams.get('demo');

    if (demo) {
      setOrderId(`ORD-${Date.now().toString(36).toUpperCase()}`);
      setPurchasedItems([{
        name: 'Demo Track',
        artist: 'O D Porter',
        audioUrl: null,
        type: 'track'
      }]);
      setLoading(false);
      return;
    }

    if (sessionId) {
      setOrderId(sessionId);

      // Fetch session metadata from our API (which reads Stripe metadata)
      fetch(`/api/session/${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.customerEmail) {
            setCustomerEmail(data.customerEmail);
          }
          if (data.paymentStatus) {
            setPaymentStatus(data.paymentStatus);
          }
          if (Array.isArray(data.items) && data.items.length > 0) {
            setPurchasedItems(data.items);
          } else if (data.item?.name) {
            setPurchasedItems([data.item]);
          } else {
            setLoadError('We confirmed your payment, but order details are still being collected.');
            setPurchasedItems([]);
          }
          setLoading(false);
        })
        .catch(() => {
          setLoadError('We confirmed your payment, but we could not load the full order details yet.');
          setPurchasedItems([]);
          setLoading(false);
        });
    } else {
      router.push('/');
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-12 text-center border border-[var(--pf-border)]">
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-bg)]" />
              <div className="h-6 bg-[var(--pf-bg)] rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-[var(--pf-bg)] rounded w-1/3 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-2xl">
        <div className="bg-[var(--pf-surface)] rounded-2xl p-8 md:p-12 text-center border border-[var(--pf-border)]">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="text-green-400" size={40} />
          </div>

          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-[var(--pf-text-secondary)] mb-2">
            Thank you for supporting independent artists.
          </p>
          {orderId && (
            <p className="text-sm text-[var(--pf-text-muted)] mb-8">
              Order ID: <span className="font-mono">{orderId}</span>
            </p>
          )}
          {paymentStatus && (
            <p className="text-sm text-[var(--pf-text-secondary)] mb-8">
              Payment status: <span className="font-medium capitalize">{paymentStatus}</span>
            </p>
          )}

          {/* Artist Impact */}
          <div className="bg-gradient-to-r from-[var(--pf-orange)]/10 to-purple-500/10 border border-[var(--pf-orange)]/30 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Package className="text-[var(--pf-orange)]" size={24} />
              <span className="text-2xl font-bold text-[var(--pf-orange)]">80%</span>
            </div>
            <p className="text-sm text-[var(--pf-text-secondary)]">
              of your purchase goes directly to artists
            </p>
          </div>

          {/* Downloads Section */}
          <div className="bg-[var(--pf-bg)] rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Download size={20} className="text-[var(--pf-orange)]" />
              Your Downloads
            </h2>
            
            {purchasedItems.length > 0 ? (
              <div className="space-y-3">
                {purchasedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[var(--pf-surface)] rounded-lg border border-[var(--pf-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center">
                        <Music size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">
                          {[item.artist, item.quantity ? `Qty ${item.quantity}` : null].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const dl = item.downloadUrl || item.audioUrl || item.audio_url;
                      if (dl && dl !== '#') {
                        return (
                          <a href={dl} download target="_blank" rel="noopener noreferrer"
                            className="px-4 py-2 bg-[var(--pf-orange)] text-white rounded-lg font-medium hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Download
                          </a>
                        );
                      }
                      return (
                        <span className="px-4 py-2 bg-[var(--pf-bg)] text-[var(--pf-text-muted)] rounded-lg text-sm">
                          No download available
                        </span>
                      );
                    })()}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-[var(--pf-text-secondary)]">
                  {loadError || 'We are still loading your order details.'}
                </p>
                <p className="mt-2 text-sm text-[var(--pf-text-muted)]">
                  Your payment went through. Refresh in a moment if the purchased items do not appear yet.
                </p>
              </div>
            )}
            
            <p className="text-xs text-[var(--pf-text-muted)] mt-4">
              {customerEmail ? `Receipt and order details will be sent to ${customerEmail}.` : 'Receipt and order details will be sent to your email.'}
            </p>
          </div>

          {/* What's Next */}
          <div className="text-left mb-8">
            <h2 className="font-semibold mb-4">What's Next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--pf-bg)]">
                <Mail className="text-[var(--pf-orange)] shrink-0" size={20} />
                <div>
                  <p className="font-medium">Check your email</p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">
                    {customerEmail
                      ? `We&apos;ve sent your receipt and order details to ${customerEmail}.`
                      : 'We&apos;ve sent your receipt and order details to your email address.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--pf-bg)]">
                <Music className="text-[var(--pf-orange)] shrink-0" size={20} />
                <div>
                  <p className="font-medium">Keep supporting artists</p>
                  <p className="text-sm text-[var(--pf-text-secondary)]">
                    Browse more music, merch, and artist pages while your order is being processed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/music" className="pf-btn pf-btn-primary inline-flex items-center justify-center gap-2">
              <Music size={18} />
              Browse More Music
            </Link>
            <Link href="/store" className="pf-btn pf-btn-secondary inline-flex items-center justify-center gap-2">
              Shop Artists
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="bg-[var(--pf-surface)] rounded-2xl p-12 text-center border border-[var(--pf-border)]">
            <div className="animate-pulse">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-bg)]" />
              <div className="h-6 bg-[var(--pf-bg)] rounded w-1/2 mx-auto mb-4" />
              <div className="h-4 bg-[var(--pf-bg)] rounded w-1/3 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
