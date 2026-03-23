'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

// Product categories for filtering
const CATEGORIES = [
  'All',
  'Apparel',
  'Tech',
  'Home & Living',
  'Art',
  'Accessories',
]

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loaded, setLoaded] = useState(false)

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

  // Initialize Shopify after script loads
  useEffect(() => {
    const initShopify = () => {
      if ((window as any).ShopifyBuy && (window as any).ShopifyBuy.UI) {
        const client = (window as any).ShopifyBuy.buildClient({
          domain: 'swqtx2-z2.myshopify.com',
          storefrontAccessToken: 'db4a3ef899f653e334757557b8ab8fba',
        })
        
        ;(window as any).ShopifyBuy.UI.onReady(client).then((ui: any) => {
          ui.createComponent('collection', {
            id: '292162404446',
            node: document.getElementById('collection-component-1774238539516'),
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
        })
      }
    }

    // Check if already loaded
    if ((window as any).ShopifyBuy && (window as any).ShopifyBuy.UI) {
      initShopify()
    }
  }, [])

  return (
    <>
      {/* Shopify Buy Button Script */}
      <Script
        src="https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          const initShopify = () => {
            if ((window as any).ShopifyBuy && (window as any).ShopifyBuy.UI) {
              const client = (window as any).ShopifyBuy.buildClient({
                domain: 'swqtx2-z2.myshopify.com',
                storefrontAccessToken: 'db4a3ef899f653e334757557b8ab8fba',
              })
              
              ;(window as any).ShopifyBuy.UI.onReady(client).then((ui: any) => {
                ui.createComponent('collection', {
                  id: '292162404446',
                  node: document.getElementById('collection-component-1774238539516'),
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
                          }
                        },
                        button: {
                          'background-color': '#f97316',
                          ':hover': { 'background-color': '#ea580c' }
                        }
                      },
                      text: { button: 'Add to Cart' }
                    },
                    cart: {
                      styles: {
                        button: {
                          'background-color': '#f97316',
                          ':hover': { 'background-color': '#ea580c' }
                        }
                      },
                      text: { total: 'Subtotal', button: 'Checkout' }
                    }
                  }
                })
              })
            }
          }
          initShopify()
        }}
      />

      <div className="min-h-screen pt-20 pb-24 overflow-x-hidden bg-white">
        <div className="pf-container max-w-6xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Official Porterful merch — all sales support independent artists</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
              <svg 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                    category === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="text-gray-500">Sort by:</span>
              <button className="text-orange-500 font-medium hover:underline">Popular</button>
              <button className="text-gray-600 hover:text-orange-500">Newest</button>
              <button className="text-gray-600 hover:text-orange-500">Price: Low to High</button>
              <button className="text-gray-600 hover:text-orange-500">Price: High to Low</button>
            </div>
          </div>

          {/* Featured Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">👕</div>
              <p className="font-medium text-gray-900">Apparel</p>
              <p className="text-sm text-gray-500">Tees, Hoodies & More</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-medium text-gray-900">Tech</p>
              <p className="text-sm text-gray-500">Cases & Accessories</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🏠</div>
              <p className="font-medium text-gray-900">Home</p>
              <p className="text-sm text-gray-500">Mugs, Posters & More</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🎵</div>
              <p className="font-medium text-gray-900">Music</p>
              <p className="text-sm text-gray-500">Vinyl & CDs</p>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-orange-50 to-purple-50 rounded-xl p-4 mb-6 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛒</div>
              <div>
                <p className="font-medium text-gray-900">Free Shipping on Orders $50+</p>
                <p className="text-sm text-gray-600">All products printed on demand and shipped directly to you</p>
              </div>
            </div>
          </div>

          {/* Shopify Collection */}
          <div id="collection-component-1774238539516"></div>

          {/* Loading State */}
          {!loaded && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Checkout powered by Shopify — Your purchase supports independent artists
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Questions? Contact us at support@porterful.com
            </p>
          </div>
        </div>
      </div>
    </>
  )
}