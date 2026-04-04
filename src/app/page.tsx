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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/>
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/>
        <circle cx="5" cy="19" r="2"/>
        <circle cx="19" cy="19" r="2"/>
        <path d="M12 7v4M12 11l-5.5 5M12 11l5.5 5"/>
      </svg>
    ),
  },
  {
    id: 'mind',
    label: 'CREDIT',
    subtitle: 'Protect and build.',
    route: 'https://creditklimb.com',
    glowColor: '#3b82f6',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  hue: number
  pulse: number
  pulseSpeed: number
  pulseOffset: number
}

function createParticle(width: number, height: number): Particle {
  // Dark, muted hues only — deep blues, purples, indigos
  // No bright oranges, yellows, or greens — those feel cheap
  const hues = [230, 245, 260, 270, 280, 290]
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    size: Math.random() * 1.5 + 0.3,
    opacity: Math.random() * 0.3 + 0.05,
    hue: hues[Math.floor(Math.random() * hues.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.008 + 0.002,
    pulseOffset: Math.random() * Math.PI * 2,
  }
}

export default function HomePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [time, setTime] = useState(0)
  const [motionOffset, setMotionOffset] = useState({ x: 0, y: 0 })
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const targetIndexRef = useRef(0)

  // Gyroscope / device motion for subtle parallax
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMotion = (e: DeviceMotionEvent | DeviceOrientationEvent) => {
      const tiltX = (e as DeviceOrientationEvent).gamma ?? 0
      const tiltY = (e as DeviceOrientationEvent).beta ?? 0
      setMotionOffset({
        x: (tiltX / 90) * 8,
        y: (tiltY / 90) * 8,
      })
    }

    window.addEventListener('deviceorientation', handleMotion, { passive: true })
    return () => window.removeEventListener('deviceorientation', handleMotion)
  }, [])

  const getGlowIntensity = useCallback((index: number) => {
    const isActive = activeIndex === index
    const isHovered = hoveredIndex === index
    if (!isActive && !isHovered) return 0
    const base = isActive ? 0.7 : 0.35
    const pulse = Math.sin(time * 0.002 + index * 1.2) * 0.25 + 0.75
    return base * pulse
  }, [activeIndex, hoveredIndex, time])

  // Touch swipe support
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let touchStartY = 0
    let accumulatedDelta = 0
    const snapThreshold = 50

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      accumulatedDelta = 0
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const delta = touchStartY - e.touches[0].clientY
      accumulatedDelta = delta
    }

    const handleTouchEnd = () => {
      if (Math.abs(accumulatedDelta) > snapThreshold && !isScrollingRef.current) {
        const direction = accumulatedDelta > 0 ? 1 : -1
        const nextIndex = Math.max(0, Math.min(SYSTEMS.length - 1, activeIndex + direction))
        if (nextIndex !== activeIndex) {
          targetIndexRef.current = nextIndex
          setActiveIndex(nextIndex)
          isScrollingRef.current = true
          const targetEl = itemRefs.current[nextIndex]
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false
          }, 600)
        }
      }
    }

    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [activeIndex])

  // Wheel scroll — smooth, spring-like
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let accumulatedDelta = 0
    const snapThreshold = 60
    let rafId: number | null = null

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      accumulatedDelta += e.deltaY * 0.8

      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (Math.abs(accumulatedDelta) > snapThreshold && !isScrollingRef.current) {
          const direction = accumulatedDelta > 0 ? 1 : -1
          const nextIndex = Math.max(0, Math.min(SYSTEMS.length - 1, activeIndex + direction))
          if (nextIndex !== activeIndex) {
            targetIndexRef.current = nextIndex
            setActiveIndex(nextIndex)
            isScrollingRef.current = true
            const targetEl = itemRefs.current[nextIndex]
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            scrollTimeoutRef.current = setTimeout(() => {
              isScrollingRef.current = false
              accumulatedDelta = 0
            }, 600)
          } else {
            accumulatedDelta = 0
          }
        }
      })
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (rafId) cancelAnimationFrame(rafId)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [activeIndex])

  // Canvas — fewer, subtler particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      // Fewer particles — 1 per 25000px (was 12000)
      const count = Math.floor((canvas.width * canvas.height) / 25000)
      particlesRef.current = Array.from({ length: count }, () =>
        createParticle(canvas.width, canvas.height)
      )
    }

    resize()
    window.addEventListener('resize', resize)

    let lastTime = 0
    const animate = (timestamp: number) => {
      const delta = timestamp - lastTime
      lastTime = timestamp
      setTime(timestamp)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const offsetX = motionOffset.x
      const offsetY = motionOffset.y

      particlesRef.current.forEach((p) => {
        p.x += p.vx * (delta * 0.05)
        p.y += p.vy * (delta * 0.05)
        p.pulse += p.pulseSpeed * delta * 0.05

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const glowPulse = Math.sin(p.pulse + p.pulseOffset) * 0.3 + 0.7
        const alpha = p.opacity * glowPulse

        // Subtle parallax from gyroscope
        const px = p.x + offsetX * (p.y / canvas.height) * 0.2
        const py = p.y + offsetY * (p.x / canvas.width) * 0.2

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5)
        gradient.addColorStop(0, `hsla(${p.hue}, 60%, 60%, ${alpha * 0.3})`)
        gradient.addColorStop(0.5, `hsla(${p.hue}, 50%, 50%, ${alpha * 0.08})`)
        gradient.addColorStop(1, `hsla(${p.hue}, 40%, 40%, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(px, py, p.size * 5, 0, Math.PI * 2)
        ctx.fill()

        // Very faint core
        ctx.fillStyle = `hsla(${p.hue}, 70%, 85%, ${alpha * 0.8})`
        ctx.beginPath()
        ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2)
        ctx.fill()

        // Sparse connection lines — only very close particles
        for (let j = 0; j < particlesRef.current.length; j += 8) {
          const p2 = particlesRef.current[j]
          if (p2 === p) continue
          const dx = px - (p2.x + offsetX * (p2.y / canvas.height) * 0.5)
          const dy = py - (p2.y + offsetY * (p2.x / canvas.width) * 0.5)
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 30) {
            const lineAlpha = (1 - dist / 60) * 0.04 * glowPulse
            ctx.strokeStyle = `hsla(${p.hue}, 50%, 60%, ${lineAlpha})`
            ctx.lineWidth = 0.3
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [motionOffset])

  // Intersection observer — cleaner, no sticky
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    itemRefs.current.forEach((el, i) => {
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5 && !isScrollingRef.current) {
            if (i !== activeIndex) {
              targetIndexRef.current = i
              setActiveIndex(i)
            }
          }
        },
        { threshold: 0.5 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [activeIndex])

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* CANVAS — subtle dark particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="text-center">
          <span
            className="text-2xl font-bold tracking-widest"
            style={{
              color: 'var(--pf-text-muted)',
              letterSpacing: '0.35em',
              textShadow: '0 0 80px hsla(250, 10%, 5%, 0.9)',
            }}
          >
            PORTERFUL
          </span>
        </div>
      </header>

      {/* SCROLL CONTAINER */}
      <main
        ref={scrollContainerRef}
        className="relative z-10"
        style={{
          height: '100vh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          const isHovered = hoveredIndex === i
          const isVisible = isActive || isHovered
          const glowIntensity = getGlowIntensity(i)
          const breathe = Math.sin(time * 0.0015 + i * 0.8) * 0.5 + 0.5

          return (
            <div
              key={system.id}
              ref={(el) => { itemRefs.current[i] = el }}
              className="min-h-screen flex items-center justify-center cursor-pointer"
              style={{
                opacity: isVisible ? 1 : 0.08,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                transition: 'opacity 400ms ease-out',
                zIndex: isVisible ? 20 : 1,
              }}
              onClick={() => {
                if (system.isExternal) {
                  window.open(system.route, '_blank', 'noopener,noreferrer')
                } else if (system.route.startsWith('http')) {
                  window.location.href = system.route
                } else {
                  router.push(system.route)
                }
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >

              {/* SUBTLE GLOW BLOOM */}
              {isVisible && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    filter: 'blur(100px)',
                    opacity: glowIntensity * 0.25,
                  }}
                >
                  <div
                    className="w-80 h-80 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${system.glowColor}30 0%, transparent 70%)`,
                    }}
                  />
                </div>
              )}

              <div className="text-center relative z-10">

                {/* ICON */}
                <div
                  className="inline-flex items-center justify-center mb-8"
                  style={{
                    color: isActive ? system.glowColor : '#2a2a2a',
                    filter: isActive
                      ? `drop-shadow(0 0 12px ${system.glowColor}60) drop-shadow(0 0 24px ${system.glowColor}25)`
                      : 'none',
                    transform: isActive ? `scale(${1 + breathe * 0.04})` : 'scale(1)',
                    transition: 'transform 500ms ease-out, color 400ms ease-out, filter 400ms ease-out',
                  }}
                >
                  {system.icon}
                </div>

                {/* SYSTEM NAME */}
                <h2
                  className="text-5xl md:text-7xl font-bold tracking-widest mb-4"
                  style={{
                    color: isActive ? '#e0e0e0' : '#1c1c1c',
                    textShadow: isActive
                      ? `0 0 30px ${system.glowColor}30`
                      : 'none',
                    transform: isActive ? `translateY(${breathe * -1}px)` : 'none',
                    transition: 'color 400ms ease-out, text-shadow 400ms ease-out, transform 500ms ease-out',
                  }}
                >
                  {system.label}
                </h2>

                {/* SUBTITLE */}
                <p
                  className="text-sm tracking-widest uppercase"
                  style={{
                    color: isActive ? system.glowColor : '#2a2a2a',
                    opacity: isActive ? 0.85 : 0,
                    transform: isActive ? `translateY(${breathe * 2}px)` : 'translateY(6px)',
                    transition: 'opacity 400ms ease-out, color 400ms ease-out, transform 500ms ease-out',
                    textShadow: isActive ? `0 0 15px ${system.glowColor}30` : 'none',
                  }}
                >
                  {system.subtitle}
                </p>

                {/* SCROLL HINT — only on first, fades out after first scroll */}
                {i === 0 && isActive && (
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    style={{ color: 'var(--pf-text-muted)', transition: 'opacity 600ms ease-out' }}
                  >
                    <span className="text-xs uppercase tracking-widest">Scroll</span>
                    <div className="w-px h-8 bg-current opacity-25" />
                  </div>
                )}
              </div>

              {/* SIDE GLOW LINE */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-32"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${system.glowColor}, transparent)`,
                    opacity: 0.35 + breathe * 0.15,
                    boxShadow: `0 0 8px ${system.glowColor}40`,
                    transition: 'opacity 400ms ease-out',
                  }}
                />
              )}
            </div>
          )
        })}

        {/* Bottom buffer — prevents last section from getting stuck */}
        <div style={{ height: '100vh' }} aria-hidden="true" />
      </main>

      {/* SECTION DOTS */}
      <nav
        className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3"
        aria-label="Section navigation"
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          return (
            <button
              key={system.id}
              onClick={() => {
                if (isScrollingRef.current) return
                isScrollingRef.current = true
                targetIndexRef.current = i
                setActiveIndex(i)
                const targetEl = itemRefs.current[i]
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                setTimeout(() => { isScrollingRef.current = false }, 600)
              }}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isActive ? system.glowColor : '#3a3a3a',
                boxShadow: isActive ? `0 0 6px ${system.glowColor}60` : 'none',
                transform: isActive ? 'scale(1.6)' : 'scale(1)',
                transition: 'background 300ms ease-out, box-shadow 300ms ease-out, transform 300ms ease-out',
              }}
              aria-label={`Go to ${system.label}`}
            />
          )
        })}
      </nav>

      {/* FOOTER */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-8 py-4 text-center z-50"
        style={{ color: 'var(--pf-text-muted)' }}
      >
        <span className="text-xs tracking-widest uppercase">Porterful Ecosystem</span>
      </footer>

      <style jsx global>{`
        ::-webkit-scrollbar { width: 0px; background: transparent; }
        html { scroll-behavior: smooth; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}
