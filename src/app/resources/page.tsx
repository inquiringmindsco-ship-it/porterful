import Link from 'next/link'
import { CreditCard, DollarSign, TrendingUp, PiggyBank, FileText, Calculator, ArrowRight, ExternalLink } from 'lucide-react'

const RESOURCES = [
  {
    category: 'Credit & Finance',
    items: [
      {
        name: 'CreditKlimb',
        tagline: 'Free credit repair tools for artists',
        description: 'Dispute letters, credit calculators, score simulators, and business credit building — all free. Built specifically to help creatives climb their credit.',
        href: 'https://creditklimb.com',
        icon: CreditCard,
        color: 'bg-blue-500',
        badge: 'Our Pick',
      },
      {
        name: 'Self Financial',
        tagline: 'Credit-builder loan',
        description: 'Build credit while saving money. $25/month credit-builder loan that reports to all three bureaus.',
        href: 'https://www.self.inc',
        icon: PiggyBank,
        color: 'bg-green-500',
        external: true,
      },
      {
        name: 'Experian Boost',
        tagline: 'Free credit boost',
        description: 'Connect your bank account to add utility and streaming payments to your Experian report. Free.',
        href: 'https://www.experian.com/boost',
        icon: TrendingUp,
        color: 'bg-orange-500',
        external: true,
      },
    ],
  },
  {
    category: 'Payments & Monetization',
    items: [
      {
        name: 'Stripe',
        tagline: 'Payment processing',
        description: 'Accept payments online. The standard for independent artists selling direct.',
        href: 'https://stripe.com',
        icon: DollarSign,
        color: 'bg-purple-500',
        external: true,
      },
      {
        name: 'PayPal Business',
        tagline: 'Invoice & payments',
        description: 'Send invoices, accept payments, manage freelancer income.',
        href: 'https://www.paypal.com/business',
        icon: DollarSign,
        color: 'bg-blue-600',
        external: true,
      },
    ],
  },
  {
    category: 'Business Tools',
    items: [
      {
        name: 'Wave',
        tagline: 'Free accounting',
        description: 'Free invoicing, accounting, and receipt scanning for small businesses.',
        href: 'https://www.waveapps.com',
        icon: FileText,
        color: 'bg-indigo-500',
        external: true,
      },
      {
        name: 'Square',
        tagline: 'POS & business',
        description: 'Point of sale, invoices, and business management for creatives.',
        href: 'https://squareup.com',
        icon: Calculator,
        color: 'bg-black',
        external: true,
      },
    ],
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero */}
      <section className="py-16 px-6 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Resources for <span className="text-purple-400">Artists</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Tools, platforms, and guides to help you manage money, build credit, and run your creative business.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="py-12 px-6 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-medium text-zinc-400 mb-6">Featured Resource</h2>
          
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-8 md:p-12">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <CreditCard size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-2xl font-bold">CreditKlimb</h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">Our Pick</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">100% Free</span>
                </div>
                <p className="text-zinc-400 mb-4">Free credit repair tools for artists</p>
                <p className="text-zinc-300 mb-6 max-w-2xl">
                  Built by the same team as Porterful. Dispute letters, credit calculators, score simulators, 
                  Net30 vendor finder, and business credit building — all completely free.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="https://creditklimb.com" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link 
                    href="https://creditklimb.com/business-credit" 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Business Credit Building
                  </Link>
                </div>
              </div>
              <div className="hidden xl:block text-sm text-zinc-500">
                <div className="space-y-1">
                  <div>✓ Dispute letter generator</div>
                  <div>✓ Credit score calculator</div>
                  <div>✓ Score simulator</div>
                  <div>✓ Debt payoff planner</div>
                  <div>✓ Net30 vendor finder</div>
                  <div>✓ Business credit guide</div>
                  <div>✓ All 100% free</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Resources */}
      {RESOURCES.map((section) => (
        <section key={section.category} className="py-12 px-6 border-b border-zinc-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-lg font-medium text-zinc-400 mb-6">{section.category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((resource) => (
                <a
                  key={resource.name}
                  href={resource.href}
                  target={resource.external ? '_blank' : undefined}
                  rel={resource.external ? 'noopener noreferrer' : undefined}
                  className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${resource.color} flex items-center justify-center flex-shrink-0`}>
                      <resource.icon size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{resource.name}</h3>
                        {resource.external && <ExternalLink size={14} className="text-zinc-500 flex-shrink-0" />}
                      </div>
                      <p className="text-sm text-zinc-500 mb-2">{resource.tagline}</p>
                      <p className="text-sm text-zinc-400 line-clamp-2">{resource.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div>Porterful — Music & Commerce for Artists</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
