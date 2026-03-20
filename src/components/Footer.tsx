'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#111] border-t border-gray-800 py-12 mt-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <h3 className="text-white font-bold text-xl mb-3">PORTERFUL</h3>
            <p className="text-gray-400 text-sm mb-4">
              The Artist Economy.<br />
              Where creators own everything.
            </p>
            <p className="text-gray-500 text-sm">
              Coming soon on social media
            </p>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors text-sm">Shop</Link></li>
              <li><Link href="/digital" className="text-gray-400 hover:text-white transition-colors text-sm">Music</Link></li>
              <li><Link href="/radio" className="text-gray-400 hover:text-white transition-colors text-sm">Radio</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors text-sm">Proud to Pay</Link></li>
            </ul>
          </div>

          {/* Sell */}
          <div>
            <h3 className="font-semibold mb-4">Sell</h3>
            <ul className="space-y-2">
              <li><Link href="/dashboard/upload" className="text-gray-400 hover:text-white transition-colors text-sm">Upload Music</Link></li>
              <li><Link href="/dashboard/add-product" className="text-gray-400 hover:text-white transition-colors text-sm">Add Merch</Link></li>
              <li><Link href="/signup?role=artist" className="text-gray-400 hover:text-white transition-colors text-sm">Become an Artist</Link></li>
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