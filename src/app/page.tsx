'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const SYSTEMS = [
  {
    id: 'music',
    label: 'MUSIC',
    subtitle: 'Experience creators.',
    route: '/music',
    glowColor: '#ff6b00',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
      </svg>
    ),
  },
  {
    id: 'identity',
    label: 'IDENTITY',
    subtitle: 'Personal pieces. Curated objects.',
    route: '/shop',
    glowColor: '#eab308',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    ),
  },
  {
    id: 'land',
    label: 'LAND',
    subtitle: 'Acquire. Control. Build.',
    route: '/systems',
    glowColor: '#22c55e',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    id: 'mind',
    label: 'MIND',
    subtitle: 'Optimize your life.',
    route: '/learn',
    glowColor: '#a855f7',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/>
        <path d="M9 21v-2a3 3 0 0 1 6 0v2"/>
      </svg>
    ),
  },
  {
    id: 'law',
    label: 'LAW',
    subtitle: 'Protect and defend.',
    route: '/systems',
    glowColor: '#3b82f6',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'LEARN',
    subtitle: 'Build the next generation.',
    route: '/learn',
    glowColor: '#ec4899',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
]

export default function HomePage() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    itemRefs.current.forEach((el, i) => {
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveIndex(i)
            // Haptic-like pulse on activation
            if ('vibrate' in navigator) {
              navigator.vibrate(5)
            }
          }
        },
        {
          threshold: 0.5,
          rootMargin: '-20% 0px -20% 0px',
        }
      )

      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <div className="min-h-screen bg-black">

      {/* PORTERFUL WORDMARK — subtle graphite on black */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="text-center">
          <span
            className="text-2xl font-bold tracking-widest"
            style={{
              color: '#2a2a2a',
              letterSpacing: '0.4em',
            }}
          >
            PORTERFUL
          </span>
        </div>
      </header>

      {/* VERTICAL SCROLL EXPERIENCE */}
      <main className="flex flex-col">
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          const isHovered = hoveredIndex === i
          const isVisible = activeIndex === i || hoveredIndex === i

          return (
            <div
              key={system.id}
              ref={(el) => { itemRefs.current[i] = el }}
              className="relative min-h-screen flex items-center justify-center cursor-pointer transition-opacity duration-700"
              style={{
                opacity: isVisible ? 1 : 0.12,
              }}
              onClick={() => router.push(system.route)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="text-center">

                {/* ICON */}
                <div
                  className="inline-flex items-center justify-center mb-8 transition-all duration-500"
                  style={{
                    color: isActive ? system.glowColor : '#333333',
                    filter: isActive ? `drop-shadow(0 0 20px ${system.glowColor}60) drop-shadow(0 0 40px ${system.glowColor}30)` : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {system.icon}
                </div>

                {/* SYSTEM NAME */}
                <h2
                  className="text-5xl md:text-6xl font-bold tracking-widest mb-4 transition-all duration-500"
                  style={{
                    color: isActive ? '#e0e0e0' : '#222222',
                    textShadow: isActive ? `0 0 60px ${system.glowColor}30` : 'none',
                  }}
                >
                  {system.label}
                </h2>

                {/* SUBTITLE */}
                <p
                  className="text-sm tracking-widest uppercase transition-all duration-500"
                  style={{
                    color: isActive ? system.glowColor : '#2a2a2a',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(8px)',
                  }}
                >
                  {system.subtitle}
                </p>

                {/* SCROLL HINT on first item */}
                {i === 0 && activeIndex === 0 && (
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    style={{ color: '#2a2a2a' }}
                  >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <div className="w-px h-8 bg-current opacity-40 animate-pulse" />
                  </div>
                )}
              </div>

              {/* SIDE GLOW LINE */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-32 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${system.glowColor}, transparent)`,
                    opacity: 0.4,
                  }}
                />
              )}
            </div>
          )
        })}
      </main>

      {/* FOOTER — barely visible */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-8 py-4 text-center"
        style={{ color: '#1a1a1a' }}
      >
        <span className="text-xs tracking-widest uppercase">Porterful Ecosystem</span>
      </footer>
    </div>
  )
}
