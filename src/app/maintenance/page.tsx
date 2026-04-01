'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] flex flex-col">
      {/* Minimal header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--pf-orange)] to-[var(--pf-purple)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-lg tracking-tight">PORTERFUL</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Under <span className="text-[var(--pf-orange)]">Construction</span>
          </h1>
          <p className="text-[var(--pf-text-secondary)] text-lg mb-8">
            We&apos;re building something better. The site will be back shortly —
            bigger, cleaner, and more powerful than before.
          </p>

          {/* Progress bar */}
          <div className="w-full bg-[var(--pf-surface)] rounded-full h-2 mb-3 border border-[var(--pf-border)] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--pf-orange)] to-purple-500 rounded-full animate-pulse"
              style={{ width: '72%' }}
            />
          </div>
          <p className="text-xs text-[var(--pf-text-muted)] mb-8">Making it right...</p>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.instagram.com/porterful"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[var(--pf-orange)] text-white font-semibold rounded-xl hover:bg-[var(--pf-orange-dark)] transition-colors"
            >
              Follow the Journey
            </a>
            <a
              href="mailto:porterful@gmail.com"
              className="px-6 py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] font-semibold rounded-xl hover:border-[var(--pf-orange)] transition-colors"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[var(--pf-text-muted)]">
        Porterful — Built for artists, by artists.
      </footer>
    </div>
  )
}
