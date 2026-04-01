'use client';
import Link from 'next/link';
import { ArrowRight, Clock, Hammer } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--pf-bg)]">
      <div className="max-w-xl w-full mx-auto px-6 text-center">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--pf-orange)]/10 border border-[var(--pf-orange)]/20 mb-8">
          <Hammer size={36} className="text-[var(--pf-orange)]" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Under Construction
        </h1>
        <p className="text-[var(--pf-text-secondary)] text-lg mb-8 leading-relaxed">
          We're building something better. Porterful is getting a major upgrade — come back soon.
        </p>

        {/* ETA */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 mb-10">
          <Clock size={14} />
          <span>Expected back: Soon™</span>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <p className="text-sm text-white/40 mb-4">Need to reach us?</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-[var(--pf-orange)] hover:bg-[var(--pf-orange-dark)] text-white font-bold rounded-xl transition-colors"
          >
            Contact Us
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-colors"
          >
            Join Our Discord for Updates
          </Link>
        </div>

      </div>
    </div>
  );
}
