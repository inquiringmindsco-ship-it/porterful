'use client';

import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="bg-[#111] border-t border-gray-800 py-12 mt-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-gray-400 text-sm mb-4">
              The Artist Economy.<br />
              Where creators own everything.
            </p>
            <div className="flex gap-4">
              <a href="https://twitter.com/porterful" target="_blank" rel="noopener" className="text-gray-500 hover:text-[#ff6b00] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.25z"/>
                </svg>
              </a>
              <a href="https://instagram.com/porterful" target="_blank" rel="noopener" className="text-gray-500 hover:text-[#ff6b00] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/artists" className="text-gray-400 hover:text-white transition-colors text-sm">Artists</Link></li>
              <li><Link href="/radio" className="text-gray-400 hover:text-white transition-colors text-sm">Radio</Link></li>
              <li><Link href="/trending" className="text-gray-400 hover:text-white transition-colors text-sm">Trending</Link></li>
              <li><Link href="/superfan" className="text-gray-400 hover:text-white transition-colors text-sm">Superfans</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">Dashboard</Link></li>
              <li><Link href="/dashboard/add-product" className="text-gray-400 hover:text-white transition-colors text-sm">Add Product</Link></li>
              <li><Link href="/signup?role=artist" className="text-gray-400 hover:text-white transition-colors text-sm">Become an Artist</Link></li>
              <li><Link href="/signup?role=business" className="text-gray-400 hover:text-white transition-colors text-sm">List Your Business</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">About</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">Terms</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Porterful. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-gray-500 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}