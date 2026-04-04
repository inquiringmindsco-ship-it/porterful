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
    id: 'land',
    label: 'LAND',
    subtitle: 'Acquire. Control. Build.',
    route: 'https://national-land-data-system.vercel.app',
    glowColor: '#22c55e',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    route: 'https://ihd-app.vercel.app',
    glowColor: '#a855f7',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    id: 'law',
    label: 'LAW',
    subtitle: 'Protect and defend.',
    route: 'https://creditklimb.com',
    glowColor: '#3b82f6',
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
  const hues = [30, 45, 60, 280, 320, 200]
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2.5 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
    hue: hues[Math.floor(Math.random() * hues.length)],
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: Math.random() * 0.015 + 0.005,
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
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getGlowIntensity = useCallback((index: number) => {
    const isActive = activeIndex === index
    const isHovered = hoveredIndex === index
    if (!isActive && !isHovered) return 0
    const base = isActive ? 0.8 : 0.4
    const pulse = Math.sin(time * 0.003 + index * 1.2) * 0.3 + 0.7
    return base * pulse
  }, [activeIndex, hoveredIndex, time])

  // Wheel scroll-snap
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let accumulatedDelta = 0
    const snapThreshold = 80

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

      accumulatedDelta += e.deltaY

      if (Math.abs(accumulatedDelta) > snapThreshold && !isScrollingRef.current) {
        const direction = accumulatedDelta > 0 ? 1 : -1
        const nextIndex = Math.max(0, Math.min(SYSTEMS.length - 1, activeIndex + direction))

        if (nextIndex !== activeIndex) {
          isScrollingRef.current = true
          setActiveIndex(nextIndex)

          const targetEl = itemRefs.current[nextIndex]
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }

          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false
            accumulatedDelta = 0
          }, 800)
        } else {
          accumulatedDelta = 0
        }
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    }
  }, [activeIndex])

  // Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const count = Math.floor((canvas.width * canvas.height) / 12000)
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

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx * (delta * 0.05)
        p.y += p.vy * (delta * 0.05)
        p.pulse += p.pulseSpeed * delta * 0.05

        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        const glowPulse = Math.sin(p.pulse + p.pulseOffset) * 0.4 + 0.6
        const alpha = p.opacity * glowPulse

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6)
        gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, ${alpha * 0.4})`)
        gradient.addColorStop(0.4, `hsla(${p.hue}, 100%, 60%, ${alpha * 0.15})`)
        gradient.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${p.hue}, 100%, 90%, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p2 = particlesRef.current[j]
          const dx = p.x - p2.x
          const dy = p.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            const lineAlpha = (1 - dist / 100) * 0.08 * glowPulse
            ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${lineAlpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
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
  }, [])

  // Intersection observer
  useEffect(() => {
    const observers: IntersectionObserver[] = []

    itemRefs.current.forEach((el, i) => {
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isScrollingRef.current) {
            setActiveIndex(i)
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
    <div className="min-h-screen bg-black relative overflow-hidden">

      {/* SPACE CANVAS */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      />

      {/* AMBIENT GLOW */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, hsla(280, 80%, 8%, 0.6) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 70%, hsla(200, 80%, 6%, 0.5) 0%, transparent 50%),
            radial-gradient(ellipse 50% 60% at 50% 50%, hsla(30, 60%, 4%, 0.3) 0%, transparent 70%)
          `,
        }}
      />

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 px-8 py-6">
        <div className="text-center">
          <span
            className="text-2xl font-bold tracking-widest"
            style={{
              color: '#3d3d3d',
              letterSpacing: '0.35em',
              textShadow: '0 0 60px hsla(0, 0%, 10%, 0.8)',
            }}
          >
            PORTERFUL
          </span>
        </div>
      </header>

      {/* SCROLL CONTAINER with snap */}
      <main
        ref={scrollContainerRef}
        className="relative z-10"
        style={{
          height: '100vh',
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'smooth',
        }}
      >
        {SYSTEMS.map((system, i) => {
          const isActive = activeIndex === i
          const isHovered = hoveredIndex === i
          const isVisible = activeIndex === i || hoveredIndex === i
          const glowIntensity = getGlowIntensity(i)
          const breathe = Math.sin(time * 0.002 + i * 0.8) * 0.5 + 0.5

          return (
            <div
              key={system.id}
              ref={(el) => { itemRefs.current[i] = el }}
              className="min-h-screen flex items-center justify-center cursor-pointer transition-opacity duration-700"
              style={{
                opacity: isVisible ? 1 : 0.1,
                scrollSnapAlign: 'start',
                scrollSnapStop: 'always',
                zIndex: isVisible ? 20 : 1,
              }}
              onClick={() => router.push(system.route)}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >

              {/* GLOW BLOOM */}
              {isVisible && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    filter: 'blur(80px)',
                    opacity: glowIntensity * 0.6,
                  }}
                >
                  <div
                    className="w-96 h-96 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${system.glowColor}40 0%, transparent 70%)`,
                    }}
                  />
                </div>
              )}

              <div className="text-center relative">

                {/* ORBITING RING */}
                {isVisible && (
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none"
                    style={{
                      animation: `orbit ${8 + i * 2}s linear infinite`,
                      opacity: Math.min(glowIntensity * 0.6, 0.6),
                    }}
                  >
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{
                        background: system.glowColor,
                        boxShadow: `0 0 10px ${system.glowColor}, 0 0 20px ${system.glowColor}60`,
                      }}
                    />
                  </div>
                )}

                {/* ICON */}
                <div
                  className="inline-flex items-center justify-center mb-8 transition-all duration-500"
                  style={{
                    color: isActive ? system.glowColor : '#333333',
                    filter: isActive
                      ? `drop-shadow(0 0 25px ${system.glowColor}80) drop-shadow(0 0 50px ${system.glowColor}40) drop-shadow(0 0 80px ${system.glowColor}20)`
                      : 'none',
                    transform: isActive ? `scale(${1.1 + breathe * 0.05})` : 'scale(1)',
                  }}
                >
                  {system.icon}
                </div>

                {/* SYSTEM NAME */}
                <h2
                  className="text-5xl md:text-7xl font-bold tracking-widest mb-4 transition-all duration-500"
                  style={{
                    color: isActive ? '#e8e8e8' : '#1e1e1e',
                    textShadow: isActive
                      ? `0 0 40px ${system.glowColor}50, 0 0 80px ${system.glowColor}20`
                      : 'none',
                    transform: isActive ? `translateY(${breathe * -2}px)` : 'none',
                  }}
                >
                  {system.label}
                </h2>

                {/* SUBTITLE */}
                <p
                  className="text-sm tracking-widest uppercase transition-all duration-500"
                  style={{
                    color: isActive ? system.glowColor : '#3d3d3d',
                    opacity: isActive ? 0.9 : 0,
                    transform: isActive ? `translateY(${breathe * 3}px)` : 'translateY(8px)',
                    textShadow: isActive ? `0 0 20px ${system.glowColor}40` : 'none',
                  }}
                >
                  {system.subtitle}
                </p>

                {/* ENERGY LINES */}
                {isActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {[...Array(8)].map((_, j) => (
                      <div
                        key={j}
                        className="absolute w-px h-24 origin-bottom"
                        style={{
                          background: `linear-gradient(to top, ${system.glowColor}30, transparent)`,
                          transform: `rotate(${j * 45}deg) translateY(-60px)`,
                          opacity: 0.3 + breathe * 0.3,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* SCROLL HINT on first item */}
                {i === 0 && activeIndex === 0 && (
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    style={{ color: '#4a4a4a' }}
                  >
                    <span className="text-xs uppercase tracking-widest animate-pulse">Scroll</span>
                    <div className="w-px h-8 bg-current opacity-30 animate-pulse" />
                  </div>
                )}
              </div>

              {/* SIDE GLOW LINE */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-40 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to bottom, transparent, ${system.glowColor}, transparent)`,
                    opacity: 0.5 + breathe * 0.2,
                    boxShadow: `0 0 10px ${system.glowColor}60, 0 0 20px ${system.glowColor}30`,
                  }}
                />
              )}
            </div>
          )
        })}
      </main>

      {/* SECTION DOTS — right side nav */}
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
                isScrollingRef.current = true
                setActiveIndex(i)
                const targetEl = itemRefs.current[i]
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                setTimeout(() => {
                  isScrollingRef.current = false
                }, 800)
              }}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                background: isActive ? system.glowColor : '#555555',
                boxShadow: isActive ? `0 0 8px ${system.glowColor}80, 0 0 16px ${system.glowColor}40` : 'none',
                transform: isActive ? `scale(1.5)` : 'scale(1)',
              }}
              aria-label={`Go to ${system.label}`}
            />
          )
        })}
      </nav>

      {/* FOOTER */}
      <footer
        className="fixed bottom-0 left-0 right-0 px-8 py-4 text-center z-50"
        style={{ color: '#4a4a4a' }}
      >
        <span className="text-xs tracking-widest uppercase">Porterful Ecosystem</span>
      </footer>

      <style jsx global>{`
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}
