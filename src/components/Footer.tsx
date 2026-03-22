'use client';

import Link from 'next/link';
import { Instagram, Twitter, Youtube, Music } from 'lucide-react';

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
            {/* Social Links */}
            <div className="flex gap-4 mt-4">
              <a 
                href="https://tiktok.com/@Porterful" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/porterful" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com/porterful" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://youtube.com/@odporter" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[var(--pf-orange)] transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="text-gray-400 hover:text-white transition-colors text-sm">Shop</Link></li>
              <li><Link href="/digital" className="text-gray-400 hover:text-white transition-colors text-sm">Music</Link></li>
              <li><Link href="/radio" className="text-gray-400 hover:text-white transition-colors text-sm">Radio</Link></li>
              <li><Link href="/playlists" className="text-gray-400 hover:text-white transition-colors text-sm">Playlists</Link></li>
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
              <li><Link href="/dashboard/artist" className="text-gray-400 hover:text-white transition-colors text-sm">Artist Dashboard</Link></li>
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