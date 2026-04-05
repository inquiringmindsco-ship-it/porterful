'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const SYSTEMS = [
  {
    id: 'music',
    label: 'MUSIC',
    subtitle: 'Experience creators.',
    route: '/music',
    glowColor: '#ff6b00',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
      </svg>
    ),
  },
  {
    id: 'credit',
    label: 'CREDIT',
    subtitle: 'Protect and build.',
    route: 'https://creditklimb.com',
    glowColor: '#3b82f6',
    isExternal: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    id: 'land',
    label: 'LAND',
    subtitle: 'Own your acre.',
    route: '/land',
    glowColor: '#22c55e',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l9 4 9-4M3 6v12l9 4 9-4M3 6l9-4 9 4"/>
        <path d="M12 10v12M12 10l9 4M12 10l9-4"/>
      </svg>
    ),
  },
  {
    id: 'systems',
    label: 'SYSTEMS',
    subtitle: 'Explore the wider ecosystem.',
    route: '/systems',
    glowColor: '#f97316',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="5" cy="19" r="2"/>
        <circle cx="19" cy="19" r="2"/>
        <path d="M12 7v4M12 11l-5.5 5M12 11l5.5 5"/>
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'LEARN',
    subtitle: 'Build the next generation.',
    route: '/teachyoung-inquiry',
    glowColor: '#ec4899',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
]

export default function HomePage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const activeIndexRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Simple scroll tracking - only update on scroll snap
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const findActiveSection = () => {
      const scrollTop = container.scrollTop
      const viewportCenter = scrollTop + container.clientHeight / 2
      let closest = 0
      let closestDist = Infinity

      itemRefs.current.forEach((el, i) => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const sectionTop = rect.top - containerRect.top + scrollTop
        const sectionCenter = sectionTop + rect.height / 2
        const dist = Math.abs(sectionCenter - viewportCenter)
        if (dist < closestDist) {
          closestDist = dist
          closest = i
        }
      })

      if (closest !== activeIndexRef.current) {
        activeIndexRef.current = closest
        setActiveIndex(closest)
      }
    }

    container.addEventListener('scroll', findActiveSection, { passive: true })
    return () => container.removeEventListener('scroll', findActiveSection)
  }, [])

  const handlePortalClick = useCallback((system: typeof SYSTEMS[0]) => {
    if (system.isExternal) {
      window.open(system.route, '_blank', 'noopener,noreferrer')
    } else {
      router.push(system.route)
    }
  }, [router])

  return (
    <div style={{ background: '#000', minHeight: '100dvh', overflow: 'hidden', position: 'relative' }}>
      {/* HEADER */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 'clamp(0.875rem, 2vw, 1.25rem)',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: 'rgba(200, 200, 210, 0.6)',
            textShadow: '0 0 40px rgba(255,255,255,0.1)',
            transition: 'color 300ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(200, 200, 210, 0.6)')}
        >
          PORTERFUL
        </button>
      </header>

      {/* SCROLL CONTAINER */}
      <main
        ref={scrollRef}
        style={{
          height: '100dvh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          const isHovered = hoveredIndex === i
          const isVisible = isActive || isHovered

          return (
            <div
              key={system.id}
              ref={el => { itemRefs.current[i] = el }}
              onClick={() => handlePortalClick(system)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                position: 'relative',
                opacity: isVisible ? 1 : 0.15,
                transition: 'opacity 400ms ease',
                zIndex: isVisible ? 20 : 1,
              }}
            >
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: '2rem' }}>

                {/* GLOW BLOOM */}
                {isVisible && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '500px',
                    height: '500px',
                    background: `radial-gradient(circle, ${system.glowColor}20 0%, transparent 65%)`,
                    filter: 'blur(60px)',
                    pointerEvents: 'none',
                    zIndex: -1,
                  }} />
                )}

                {/* ICON */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: isVisible ? system.glowColor : 'rgba(100,100,100,0.5)',
                  filter: isVisible ? `drop-shadow(0 0 16px ${system.glowColor}50)` : 'none',
                  transition: 'all 400ms ease',
                }}>
                  {system.icon}
                </div>

                {/* TITLE */}
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 10vw, 5rem)',
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  color: isVisible ? '#f0f0f0' : 'rgba(80,80,80,0.5)',
                  textShadow: isVisible ? `0 0 30px ${system.glowColor}30` : 'none',
                  marginBottom: '0.75rem',
                  transition: 'all 400ms ease',
                }}>
                  {system.label}
                </h2>

                {/* SUBTITLE */}
                <p style={{
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontWeight: 500,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: isVisible ? system.glowColor : 'rgba(60,60,60,0.5)',
                  opacity: isVisible ? 0.8 : 0,
                  transition: 'all 400ms ease',
                }}>
                  {system.subtitle}
                </p>

                {/* LINE ACCENT */}
                {isVisible && (
                  <div style={{
                    width: '1px',
                    height: '60px',
                    background: `linear-gradient(to bottom, transparent, ${system.glowColor}, transparent)`,
                    margin: '2rem auto 0',
                    opacity: 0.5,
                  }} />
                )}
              </div>
            </div>
          )
        })}
      </main>

      {/* NAV DOTS */}
      <nav style={{
        position: 'fixed',
        right: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          return (
            <button
              key={system.id}
              onClick={() => {
                const el = itemRefs.current[i]
                if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
              }}
              aria-label={`Go to ${system.label}`}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? system.glowColor : 'rgba(100,100,100,0.4)',
                boxShadow: isActive ? `0 0 8px ${system.glowColor}80` : 'none',
                transform: isActive ? 'scale(1.4)' : 'scale(1)',
                transition: 'all 300ms ease',
              }}
            />
          )
        })}
      </nav>

      {/* SCROLL HINT */}
      {activeIndex === 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          opacity: 0.4,
          animation: 'fadeInUp 1s ease-out 2s forwards',
        }}>
          <span style={{ fontSize: '0.625rem', letterSpacing: '0.3em', color: 'rgba(150,150,150,0.6)', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(150,150,150,0.4), transparent)' }} />
        </div>
      )}

      {/* Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '1rem',
        textAlign: 'center',
        fontSize: '0.625rem',
        letterSpacing: '0.3em',
        color: 'rgba(80,80,80,0.4)',
        textTransform: 'uppercase',
        zIndex: 50,
      }}>
        Porterful Ecosystem
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #000; overflow: hidden; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        ::selection { background: rgba(255,107,0,0.3); }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 0.4; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
