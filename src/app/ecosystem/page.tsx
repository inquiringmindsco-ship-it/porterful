'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const SYSTEMS = [
  {
    id: 'land',
    label: 'LAND',
    subtitle: 'Acquire. Control. Build.',
    tagline: 'The Ownership Economy.',
    route: '/land',
    glowColor: '#22c55e',
    iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
    description: 'Land intelligence, tax deed discovery, and acquisition pathways for real wealth building.',
    url: 'https://national-land-data-system.vercel.app',
  },
  {
    id: 'mind',
    label: 'MIND',
    subtitle: 'Learn. Grow. Scale.',
    tagline: 'The Knowledge Economy.',
    route: '/education',
    glowColor: '#a855f7',
    iconPath: 'M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7zM9 21v-2a3 3 0 0 1 6 0v2',
    description: 'The ARCHTEXT method. Cognitive learning infrastructure for homeschool families.',
    url: 'https://teachyoung.org',
  },
  {
    id: 'law',
    label: 'LAW',
    subtitle: 'Document. Protect. Resolve.',
    tagline: 'The Access Economy.',
    route: '/law',
    glowColor: '#3b82f6',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    description: 'Legal document assistance for incarcerated individuals and their families.',
    url: 'https://ihd-app.vercel.app',
  },
  {
    id: 'commerce',
    label: 'COMMERCE',
    subtitle: 'Trade. Exchange. Connect.',
    tagline: 'The Barter Economy.',
    route: '/commerce',
    glowColor: '#f97316',
    iconPath: 'M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
    description: 'Structured barter exchange for communities. Trade value without cash friction.',
    url: 'https://barter-os.com',
  },
  {
    id: 'credit',
    label: 'CREDIT',
    subtitle: 'Build. Restore. Rise.',
    tagline: 'The Credit Economy.',
    route: '/credit',
    glowColor: '#10b981',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    description: 'Dispute letter automation and credit pathway guidance for credit-invisible communities.',
    url: 'https://creditklimb.com',
  },
];

export default function EcosystemPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">PORTERFUL</Link>
          <Link href="/systems" className="text-sm text-[var(--pf-text-muted)] hover:text-white transition-colors">
            ← Back to Ecosystem
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-4">The Porterful Ecosystem</h1>
        <p className="text-xl text-[var(--pf-text-muted)] max-w-2xl mx-auto">Five systems. One mission.</p>
      </section>

      {/* System Cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {SYSTEMS.map(system => (
            <a
              key={system.id}
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all duration-300 overflow-hidden"
              style={{}}
            >
              {/* Glow */}
              <div
                className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(ellipse at center, ${system.glowColor}15 0%, transparent 70%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={system.glowColor}
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    <path d={system.iconPath} />
                  </svg>
                  <span
                    className="text-xs font-bold tracking-widest px-3 py-1 rounded-full"
                    style={{
                      background: `${system.glowColor}20`,
                      color: system.glowColor,
                    }}
                  >
                    {system.label}
                  </span>
                </div>

                <h2 className="text-2xl font-black mb-2">{system.subtitle}</h2>
                <p className="text-sm text-[var(--pf-text-muted)] mb-6 leading-relaxed">{system.description}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Tagline</p>
                    <p className="text-sm font-medium" style={{ color: system.glowColor }}>{system.tagline}</p>
                  </div>
                  <span className="text-xs text-gray-500 group-hover:text-white transition-colors">
                    Visit ↗
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
