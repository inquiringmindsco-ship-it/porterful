import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pf-bg)] px-4">
      <div className="text-center max-w-md">
        {/* 404 Graphic */}
        <div className="text-8xl font-bold text-[var(--pf-orange)] mb-4">404</div>
        
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. 
          It might have been moved or deleted.
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="pf-btn pf-btn-primary flex items-center justify-center gap-2">
            <Home size={18} />
            Go Home
          </Link>
          <Link href="/marketplace" className="pf-btn pf-btn-secondary flex items-center justify-center gap-2">
            <Search size={18} />
            Browse Shop
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-[var(--pf-border)]">
          <p className="text-sm text-[var(--pf-text-muted)] mb-4">Popular pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/digital" className="text-sm text-[var(--pf-orange)] hover:underline">Music</Link>
            <span className="text-[var(--pf-border)]">•</span>
            <Link href="/marketplace" className="text-sm text-[var(--pf-orange)] hover:underline">Merch</Link>
            <span className="text-[var(--pf-border)]">•</span>
            <Link href="/trending" className="text-sm text-[var(--pf-orange)] hover:underline">Trending</Link>
            <span className="text-[var(--pf-border)]">•</span>
            <Link href="/signup" className="text-sm text-[var(--pf-orange)] hover:underline">Sell</Link>
            <span className="text-[(--pf-border)]">•</span>
            <Link href="/faq" className="text-sm text-[var(--pf-orange)] hover:underline">FAQ</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
