'use client'

import Script from 'next/script'
import { useEffect, useState, useRef } from 'react'

// Shopify Buy Button instance for filtering
let shopifyUI: any = null

// Fallback shown when Shopify takes too long to load or fails
function TimeoutFallback({ hasError = false, onRetry }: { hasError?: boolean; onRetry?: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 6000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible && !hasError) return null

  return (
    <div className="text-center py-8 mt-4">
      <p className="text-gray-500 mb-3">
        {hasError ? "Couldn't load products" : 'Having trouble loading products?'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors mb-3"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
      <div>
        <a
          href="https://porterful.myshopify.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Browse shop.porterful.com
        </a>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate loading progress for better UX
  useEffect(() => {
    if (loaded) return
    const interval = setInterval(() => {
      setLoadingProgress(prev => Math.min(prev + 12, 90))
    }, 400)
    return () => clearInterval(interval)
  }, [loaded])

  // Force light theme on this page only
  useEffect(() => {
    const html = document.documentElement
    const originalTheme = html.getAttribute('data-theme') || 'dark'

    html.setAttribute('data-theme', 'light')
    html.classList.add('light')
    html.classList.remove('dark')

    return () => {
      html.setAttribute('data-theme', originalTheme)
      if (originalTheme === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }
  }, [])

  return (
    <>
      {/* Shopify Buy Button Script */}
      <Script
        src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).ShopifyBuy && (window as any).ShopifyBuy.UI) {
            const client = (window as any).ShopifyBuy.buildClient({
              domain: 'swqtx2-z2.myshopify.com',
              storefrontAccessToken: 'db4a3ef899f653e334757557b8ab8fba',
            })

            ;(window as any).ShopifyBuy.UI.onReady(client).then((ui: any) => {
              shopifyUI = ui
              ui.createComponent('collection', {
                id: '292162404446',
                node: document.getElementById('shopify-collection'),
                moneyFormat: '%24%7B%7Bamount%7D%7D',
                options: {
                  product: {
                    styles: {
                      product: {
                        '@media (min-width: 601px)': {
                          'max-width': 'calc(25% - 20px)',
                          'margin-left': '20px',
                          'margin-bottom': '50px',
                          width: 'calc(25% - 20px)'
                        },
                        img: {
                          height: 'calc(100% - 15px)',
                          position: 'absolute',
                          left: '0',
                          right: '0',
                          top: '0'
                        },
                        imgWrapper: {
                          'padding-top': 'calc(75% + 15px)',
                          position: 'relative',
                          height: '0'
                        }
                      },
                      button: {
                        'background-color': '#f97316',
                        'font-weight': '600',
                        ':hover': { 'background-color': '#ea580c' }
                      }
                    },
                    text: {
                      button: 'Add to Cart'
                    }
                  },
                  cart: {
                    styles: {
                      button: {
                        'background-color': '#f97316',
                        ':hover': { 'background-color': '#ea580c' }
                      }
                    },
                    text: {
                      total: 'Subtotal',
                      button: 'Checkout'
                    }
                  }
                }
              })
              setLoaded(true)
            }).catch(() => {
              setLoadError(true)
            })
          }
        }}
        onError={() => {
          setLoadError(true)
        }}
      />

      <div className="min-h-screen pt-20 pb-24 overflow-x-hidden bg-white">
        <div className="pf-container max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Official Porterful merch — your purchase supports independent artists</p>
          </div>

          {/* Quick Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <a href="#shopify-collection" className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">👕</div>
              <p className="font-medium text-gray-900 text-sm">Apparel</p>
            </a>
            <a href="#shopify-collection" className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">📱</div>
              <p className="font-medium text-gray-900 text-sm">Tech</p>
            </a>
            <a href="#shopify-collection" className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">🏠</div>
              <p className="font-medium text-gray-900 text-sm">Home</p>
            </a>
            <a href="#shopify-collection" className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
              <div className="text-2xl mb-1">🎵</div>
              <p className="font-medium text-gray-900 text-sm">Music</p>
            </a>
          </div>

          {/* Free Shipping Banner */}
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 mb-6 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🚚</div>
              <div>
                <p className="font-medium text-gray-900">Free shipping on orders $50+</p>
                <p className="text-sm text-gray-600">All products printed on demand and shipped directly to you</p>
              </div>
            </div>
          </div>

          {/* Shopify Products */}
          <div ref={containerRef} className="mb-8">
            {!loaded && (
              <div className="text-center py-12">
                <div className="w-48 mx-auto mb-4 bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="inline-block animate-pulse w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3 opacity-70" />
                <p className="text-gray-500">Loading products...</p>
                <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
              </div>
            )}
            <div id="shopify-collection"></div>
            {(loadError || loaded) && <TimeoutFallback hasError={loadError} />}
          </div>

          {/* How to Submit Your Own Merch */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="text-4xl">🎨</div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">Want to sell your own merch?</h3>
                <p className="text-gray-600 text-sm">
                  Artists can submit designs for print-on-demand products. No inventory needed — we handle printing and shipping.
                </p>
              </div>
              <a
                href="/dashboard/upload?type=product"
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors whitespace-nowrap"
              >
                Submit Design
              </a>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🔒</div>
              <p className="font-medium text-gray-900 text-sm">Secure Checkout</p>
              <p className="text-xs text-gray-500 mt-1">256-bit SSL encryption</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🚚</div>
              <p className="font-medium text-gray-900 text-sm">Free Shipping</p>
              <p className="text-xs text-gray-500 mt-1">On orders $50+</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">↩️</div>
              <p className="font-medium text-gray-900 text-sm">Easy Returns</p>
              <p className="text-xs text-gray-500 mt-1">30-day hassle-free</p>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl mb-2">🎨</div>
              <p className="font-medium text-gray-900 text-sm">On-Demand</p>
              <p className="text-xs text-gray-500 mt-1">Printed just for you</p>
            </div>
          </div>

          {/* Social Proof */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-6 border border-orange-100">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">2,847+</p>
                <p className="text-sm text-gray-600">Products Sold</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8★</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">80%</p>
                <p className="text-sm text-gray-600">Goes to Artists</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">15+</p>
                <p className="text-sm text-gray-600">Countries Shipped</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Secure checkout powered by Shopify
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Questions? Contact us at support@porterful.com
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
