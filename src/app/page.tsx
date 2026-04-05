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
    subtitle: 'Acquire. Control. Build.',
    route: 'https://national-land-data-system.vercel.app',
    glowColor: '#22c55e',
    isExternal: true,
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
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

// Lightweight particle system - only runs if performant
function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number; size: number; opacity: number
  }>>([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frameCount = 0
    const maxFrames = 300 // Auto-disable after 5 min at 60fps equivalent

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    const count = Math.floor((canvas.width * canvas.height) / 25000)
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.3 + 0.05,
    }))

    const draw = (timestamp: number) => {
      if (frameCount > maxFrames) {
        // Stop particles after maxFrames to prevent long-term memory buildup
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }
      frameCount++
      timeRef.current = timestamp

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 200, 220, ${p.opacity})`
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [canvasRef])
}

export default function HomePage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [introDone, setIntroDone] = useState(false)
  const [spotlightX, setSpotlightX] = useState(-100)
  const [time, setTime] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Lightweight particles
  useParticles(canvasRef)

  // Intro animation sequence
  useEffect(() => {
    // Start spotlight after brief delay
    const spotlightTimer = setTimeout(() => {
      // Animate spotlight left to right
      const start = -100
      const end = window.innerWidth + 100
      const duration = 2000
      const startTime = Date.now()

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
        setSpotlightX(start + (end - start) * eased)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Fade out spotlight and show portals
          setTimeout(() => {
            setIntroDone(true)
            setSpotlightX(-1000)
          }, 300)
        }
      }
      requestAnimationFrame(animate)
    }, 600)

    return () => clearTimeout(spotlightTimer)
  }, [])

  // Time for subtle animations
  useEffect(() => {
    let raf: number
    const updateTime = (ts: number) => {
      setTime(ts)
      raf = requestAnimationFrame(updateTime)
    }
    raf = requestAnimationFrame(updateTime)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Passive scroll tracking — browser handles snap, we just detect
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        const scrollTop = container.scrollTop
        const viewHeight = container.clientHeight
        const viewportCenter = scrollTop + viewHeight / 2

        let closestIndex = 0
        let closestDistance = Infinity

        itemRefs.current.forEach((el, i) => {
          if (!el) return
          const rect = el.getBoundingClientRect()
          const containerRect = container.getBoundingClientRect()
          const sectionTop = rect.top - containerRect.top
          const sectionCenter = sectionTop + rect.height / 2
          const distance = Math.abs(sectionCenter - viewportCenter)

          if (distance < closestDistance) {
            closestDistance = distance
            closestIndex = i
          }
        })

        if (closestIndex !== activeIndex) {
          setActiveIndex(closestIndex)
        }
      }, 80)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [activeIndex])

  const handlePortalClick = useCallback((system: typeof SYSTEMS[0]) => {
    if (system.isExternal) {
      window.open(system.route, '_blank', 'noopener,noreferrer')
    } else if (system.route.startsWith('http')) {
      window.location.href = system.route
    } else {
      router.push(system.route)
    }
  }, [router])

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* Particles canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* INTRO: Porterful with spotlight */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          opacity: introDone ? 0 : 1,
          transition: 'opacity 800ms ease-out',
          pointerEvents: introDone ? 'none' : 'none',
        }}
      >
        <div style={{ position: 'relative' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 8vw, 5rem)',
              fontWeight: 800,
              letterSpacing: '0.3em',
              color: '#e0e0e0',
              textShadow: '0 0 60px rgba(255,255,255,0.15)',
              transition: 'opacity 300ms ease-out',
              opacity: spotlightX > -500 ? 1 : 0.6,
            }}
          >
            PORTERFUL
          </h1>
          {/* Spotlight shine */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
              transform: `translateX(${spotlightX}px)`,
              width: '200px',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* HEADER */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          opacity: introDone ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
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
          scrollBehavior: 'auto',
          position: 'relative',
          zIndex: 10,
          opacity: introDone ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          const isHovered = hoveredIndex === i
          const isVisible = isActive || isHovered

          // Subtle glow intensity
          const baseGlow = isActive ? 0.6 : isHovered ? 0.35 : 0.15
          const pulse = Math.sin(time * 0.001 + i * 1.2) * 0.1 + 0.9
          const glowIntensity = baseGlow * pulse

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
                opacity: isVisible ? 1 : 0.12,
                transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: isVisible ? 20 : 1,
              }}
            >
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, padding: '2rem' }}>

                {/* GLOW BLOOM — soft and diffuse */}
                {glowIntensity > 0.2 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '400px',
                      height: '400px',
                      background: `radial-gradient(circle, ${system.glowColor}${Math.round(glowIntensity * 50).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
                      filter: 'blur(80px)',
                      pointerEvents: 'none',
                      zIndex: -1,
                    }}
                  />
                )}

                {/* ICON */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    color: isVisible ? system.glowColor : 'rgba(100,100,100,0.5)',
                    filter: isVisible
                      ? `drop-shadow(0 0 20px ${system.glowColor}60) drop-shadow(0 0 40px ${system.glowColor}30)`
                      : 'none',
                    transform: isVisible ? `scale(${1 + Math.sin(time * 0.0015 + i) * 0.02})` : 'scale(0.95)',
                    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {system.icon}
                </div>

                {/* TITLE */}
                <h2
                  style={{
                    fontSize: 'clamp(2.5rem, 10vw, 5rem)',
                    fontWeight: 800,
                    letterSpacing: '0.25em',
                    color: isVisible ? '#f0f0f0' : 'rgba(80,80,80,0.5)',
                    textShadow: isVisible
                      ? `0 0 40px ${system.glowColor}40, 0 0 80px ${system.glowColor}20`
                      : 'none',
                    marginBottom: '0.75rem',
                    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {system.label}
                </h2>

                {/* SUBTITLE */}
                <p
                  style={{
                    fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                    fontWeight: 500,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: isVisible ? system.glowColor : 'rgba(60,60,60,0.5)',
                    opacity: isVisible ? 0.8 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
                    transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {system.subtitle}
                </p>

                {/* LINE ACCENT */}
                {isVisible && (
                  <div
                    style={{
                      width: '1px',
                      height: '60px',
                      background: `linear-gradient(to bottom, transparent, ${system.glowColor}, transparent)`,
                      margin: '2rem auto 0',
                      opacity: 0.6,
                      boxShadow: `0 0 12px ${system.glowColor}60`,
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </main>

      {/* NAV DOTS */}
      <nav
        aria-label="Section navigation"
        style={{
          position: 'fixed',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          opacity: introDone ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          return (
            <button
              key={system.id}
              onClick={() => {
                const el = itemRefs.current[i]
                if (el) el.scrollIntoView({ block: 'start' })
              }}
              aria-label={`Go to ${system.label}`}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                background: isActive ? system.glowColor : 'rgba(100,100,100,0.4)',
                boxShadow: isActive ? `0 0 8px ${system.glowColor}80, 0 0 16px ${system.glowColor}40` : 'none',
                transform: isActive ? 'scale(1.4)' : 'scale(1)',
                transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          )
        })}
      </nav>

      {/* SCROLL HINT — first section only */}
      {activeIndex === 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            opacity: introDone ? 0.5 : 0,
            animation: 'fadeInUp 1s ease-out 3s forwards',
          }}
        >
          <span style={{ fontSize: '0.625rem', letterSpacing: '0.3em', color: 'rgba(150,150,150,0.6)', textTransform: 'uppercase' }}>
            Scroll
          </span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, rgba(150,150,150,0.4), transparent)' }} />
        </div>
      )}

      {/* Footer */}
      <footer
        style={{
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
          opacity: introDone ? 1 : 0,
          transition: 'opacity 600ms ease-out',
        }}
      >
        Porterful Ecosystem
      </footer>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: auto; }
        body { background: #000; overflow: hidden; }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        ::selection { background: rgba(255,107,0,0.3); }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 0.5; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
