'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// ── System Definitions ──────────────────────────────────────────
const SYSTEMS = [
  {
    id: 'music',
    label: 'MUSIC',
    subtitle: 'Stream. Own. Earn.',
    tagline: 'The Artist Economy.',
    route: '/music',
    externalUrl: null,
    glowColor: '#ff6b00',
    iconPath: 'M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
  },
  {
    id: 'land',
    label: 'LAND',
    subtitle: 'Acquire. Control. Build.',
    tagline: 'The Ownership Economy.',
    route: null,
    externalUrl: 'https://national-land-data-system.vercel.app',
    glowColor: '#22c55e',
    iconPath: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  },
  {
    id: 'mind',
    label: 'MIND',
    subtitle: 'Learn. Grow. Scale.',
    tagline: 'The Knowledge Economy.',
    route: null,
    externalUrl: 'https://teachyoung.org',
    glowColor: '#a855f7',
    iconPath: 'M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7zM9 21v-2a3 3 0 0 1 6 0v2',
  },
  {
    id: 'law',
    label: 'LAW',
    subtitle: 'Document. Protect. Resolve.',
    tagline: 'The Access Economy.',
    route: null,
    externalUrl: 'https://ihd-app.vercel.app',
    glowColor: '#3b82f6',
    iconPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    id: 'commerce',
    label: 'COMMERCE',
    subtitle: 'Trade. Exchange. Connect.',
    tagline: 'The Barter Economy.',
    route: null,
    externalUrl: 'https://barter-os.com',
    glowColor: '#f97316',
    iconPath: 'M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  },
  {
    id: 'credit',
    label: 'CREDIT',
    subtitle: 'Build. Restore. Rise.',
    tagline: 'The Credit Economy.',
    route: null,
    externalUrl: 'https://creditklimb.com',
    glowColor: '#10b981',
    iconPath: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
];

const SYSTEM_COUNT = SYSTEMS.length;

const NUM_STARS = 80;

function StarField() {
  // Use state + effect to avoid SSR/hydration mismatch from Math.random()
  const [stars, setStars] = useState<Array<{
    id: number; x: number; y: number; size: number;
    duration: number; delay: number; opacity: number;
  }>>([])

  useEffect(() => {
    setStars(
      Array.from({ length: NUM_STARS }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.6 + 0.2,
      }))
    )
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }
      `}</style>
      {stars.map(star => (
        <div
          key={star.id}
          style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            borderRadius: '50%',
            background: star.id % 5 === 0 ? '#ff6b00' : star.id % 3 === 0 ? '#a855f7' : '#ffffff',
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            boxShadow: star.id % 10 === 0 ? `0 0 ${star.size * 3}px ${star.id % 2 === 0 ? '#ff6b00' : '#a855f7'}80` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export default function SystemSelector() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndexRef = useRef(0);
  const isScrollingRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Use dynamic viewport height for mobile Safari compatibility
  const [vh, setVh] = useState(100);

  useEffect(() => {
    const updateVh = () => {
      // Use window.innerHeight for actual visible viewport (accounts for mobile address bar)
      setVh(window.innerHeight);
    };
    updateVh();
    window.addEventListener('resize', updateVh);
    window.addEventListener('orientationchange', updateVh);
    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('orientationchange', updateVh);
    };
  }, []);

  // ── Scroll Detection ─────────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const itemHeight = vh;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== lastIndexRef.current && newIndex >= 0 && newIndex < SYSTEM_COUNT) {
      lastIndexRef.current = newIndex;
      setActiveIndex(newIndex);
      if ('vibrate' in navigator) navigator.vibrate(6);
    }
  }, [vh]);

  // ── Snap to index ────────────────────────────────────────────
  const snapToIndex = useCallback((index: number) => {
    if (!containerRef.current || isTransitioning) return;
    containerRef.current.scrollTo({ top: index * vh, behavior: 'smooth' });
  }, [isTransitioning, vh]);

  // ── Enter System ────────────────────────────────────────────
  const handleEnter = useCallback((index: number) => {
    if (isTransitioning) return;
    const system = SYSTEMS[index];
    setIsTransitioning(true);
    if ('vibrate' in navigator) navigator.vibrate(12);
    setTimeout(() => {
      if (system.externalUrl) {
        window.location.href = system.externalUrl;
      } else if (system.route) {
        window.location.href = system.route;
      }
    }, 300);
  }, [isTransitioning]);

  // ── Keyboard Navigation ──────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        const newIndex = e.key === 'ArrowDown' || e.key === ' '
          ? Math.min(activeIndex + 1, SYSTEM_COUNT - 1)
          : Math.max(activeIndex - 1, 0);
        snapToIndex(newIndex);
      }
      if (e.key === 'Enter') handleEnter(activeIndex);
      if (e.key === 'Escape') snapToIndex(0);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, snapToIndex, handleEnter]);

  // ── Wheel — let CSS scroll-snap handle it natively, only nudge direction ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // Don't prevent default — let CSS scroll-snap handle the actual scroll.
      // We only track direction to update activeIndex faster for UI feedback.
      if (isScrollingRef.current || isTransitioning) return;

      // Determine intended direction
      const goingDown = e.deltaY > 0;
      const newIndex = goingDown
        ? Math.min(activeIndex + 1, SYSTEM_COUNT - 1)
        : Math.max(activeIndex - 1, 0);

      if (newIndex !== activeIndex) {
        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 600);
        snapToIndex(newIndex);
      }
    };

    container.addEventListener('wheel', onWheel, { passive: true });
    return () => container.removeEventListener('wheel', onWheel);
  }, [activeIndex, snapToIndex, isTransitioning]);

  // ── Touch swipe ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let startY = 0;
    let startTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.changedTouches[0].clientY;
      startTime = Date.now();
    };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = startY - e.changedTouches[0].clientY;
      const duration = Date.now() - startTime;
      if (Math.abs(delta) < 40) return; // Slightly lower threshold for better response
      // Ignore fast flicks that look like momentum scroll — let CSS snap handle those
      if (duration < 80 && Math.abs(delta) < 120) return;
      if (isScrollingRef.current || isTransitioning) return;

      const newIndex = delta > 0
        ? Math.min(activeIndex + 1, SYSTEM_COUNT - 1)
        : Math.max(activeIndex - 1, 0);

      if (newIndex !== activeIndex) {
        isScrollingRef.current = true;
        setTimeout(() => { isScrollingRef.current = false; }, 600);
        snapToIndex(newIndex);
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, [activeIndex, snapToIndex, isTransitioning]);

  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.6; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }
        @keyframes iconFloat {
          0%, 100% { transform: translateY(0) scale(1.05); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
      `}</style>

      {/* ── Star field background ── */}
      <StarField />

      {/* ── Porterful wordmark — top center ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 32,
        pointerEvents: 'none',
      }}>
        <span style={{
          fontSize: 11,
          letterSpacing: '0.7em',
          color: '#555',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontFamily: 'system-ui, sans-serif',
        }}>
          Porterful
        </span>
      </div>

      {/* ── Scroll Container ── */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          position: 'fixed', inset: 0,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollBehavior: 'auto',
          WebkitOverflowScrolling: 'touch',
          background: '#000000',
          height: `${vh}px`,
        }}
      >
        <style>{`
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; }
          body { overflow: hidden !important; }
        `}</style>

        {SYSTEMS.map((system, index) => {
          const isActive = index === activeIndex;
          const distance = Math.abs(index - activeIndex);
          const isVisible = distance < 3;

          // Inactive systems: visible but clearly behind
          const inactiveOpacity = Math.max(0.15, 1 - distance * 0.4);
          const inactiveScale = Math.max(0.65, 1 - distance * 0.25);
          const activeScale = 1;

          return (
            <div
              key={system.id}
              style={{
                display: 'flex',
                height: `${vh}px`,
                width: '100vw',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'start',
                position: 'relative',
              }}
            >
              {/* Radial glow when active */}
              {isActive && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse 80% 80% at 50% 50%, ${system.glowColor}18 0%, transparent 65%)`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
              )}

              {/* Content */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', padding: '0 24px',
                opacity: isActive ? 1 : inactiveOpacity,
                transform: `scale(${isActive ? activeScale : inactiveScale})`,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
                pointerEvents: isActive ? 'auto' : 'none',
                maxWidth: 520,
                position: 'relative',
                zIndex: 1,
              }}>
                {/* Icon — ALWAYS visible, just color changes */}
                <button
                  onClick={() => isActive && handleEnter(index)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isActive ? 'pointer' : 'default',
                    padding: 0,
                    marginBottom: 36,
                    position: 'relative',
                    transform: isActive ? 'scale(1)' : 'scale(0.88)',
                    transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animation: isActive ? 'iconFloat 3s ease-in-out infinite' : 'none',
                  }}
                  aria-label={`Enter ${system.label}`}
                >
                  {/* Glow ring — active only */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: -24,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${system.glowColor}30 0%, transparent 70%)`,
                      animation: 'pulse-ring 2.5s ease-out infinite',
                    }} />
                  )}

                  <svg
                    width={80} height={80}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isActive ? system.glowColor : '#3a3a3a'}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      filter: isActive ? `drop-shadow(0 0 24px ${system.glowColor}90) drop-shadow(0 0 48px ${system.glowColor}40)` : 'none',
                      transition: 'stroke 0.5s ease, filter 0.5s ease',
                      display: 'block',
                    }}
                  >
                    <path d={system.iconPath} />
                  </svg>
                </button>

                {/* Label */}
                <h2 style={{
                  fontSize: 'clamp(52px, 12vw, 96px)',
                  fontWeight: 900,
                  letterSpacing: '0.2em',
                  color: isActive ? '#ffffff' : '#2e2e2e',
                  margin: 0, marginBottom: 14,
                  textShadow: isActive ? `0 0 80px ${system.glowColor}60, 0 0 160px ${system.glowColor}20` : 'none',
                  transition: 'color 0.5s ease, text-shadow 0.5s ease',
                  fontFamily: 'system-ui, sans-serif',
                  lineHeight: 1,
                }}>
                  {system.label}
                </h2>

                {/* Subtitle */}
                <p style={{
                  fontSize: 'clamp(15px, 3vw, 20px)',
                  fontWeight: 600,
                  color: isActive ? system.glowColor : '#3a3a3a',
                  margin: 0, marginBottom: 10,
                  letterSpacing: '0.12em',
                  transition: 'color 0.5s ease',
                  fontFamily: 'system-ui, sans-serif',
                  textTransform: 'uppercase',
                }}>
                  {system.subtitle}
                </p>

                {/* Tagline */}
                <p style={{
                  fontSize: 11,
                  letterSpacing: '0.4em',
                  color: isActive ? '#555' : '#222',
                  margin: 0, marginBottom: 44,
                  textTransform: 'uppercase',
                  transition: 'color 0.5s ease',
                  fontFamily: 'system-ui, sans-serif',
                }}>
                  {system.tagline}
                </p>

                {/* CTA — active only */}
                {isActive && (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                    animation: 'fadeUp 0.5s ease forwards',
                  }}>
                    <button
                      onClick={() => handleEnter(index)}
                      style={{
                        background: system.glowColor,
                        color: '#000000',
                        border: 'none',
                        borderRadius: 999,
                        padding: '16px 52px',
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: '0.3em',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        boxShadow: `0 0 50px ${system.glowColor}50, 0 0 100px ${system.glowColor}20`,
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        fontFamily: 'system-ui, sans-serif',
                      }}
                      onMouseEnter={e => {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1.06)';
                        (e.target as HTMLButtonElement).style.boxShadow = `0 0 70px ${system.glowColor}70, 0 0 120px ${system.glowColor}30`;
                      }}
                      onMouseLeave={e => {
                        (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                        (e.target as HTMLButtonElement).style.boxShadow = `0 0 50px ${system.glowColor}50, 0 0 100px ${system.glowColor}20`;
                      }}
                    >
                      Enter
                    </button>
                    <span style={{
                      fontSize: 10, color: '#444', letterSpacing: '0.25em',
                      fontFamily: 'system-ui, sans-serif',
                    }}>
                      or press ENTER
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Progress Bar — right edge ── */}
      <div style={{
        position: 'fixed', right: 24, top: '50%', transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 100,
      }}>
        {SYSTEMS.map((system, index) => (
          <button
            key={system.id}
            onClick={() => snapToIndex(index)}
            aria-label={`Go to ${system.label}`}
            style={{
              width: 3,
              height: index === activeIndex ? 48 : 14,
              borderRadius: 2,
              background: index === activeIndex ? system.glowColor : index < activeIndex ? '#444' : '#2a2a2a',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.35s cubic-bezier(0.34, 1.2, 0.64, 1)',
              opacity: index === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      {/* ── Counter — bottom center ── */}
      <div style={{
        position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', alignItems: 'center', gap: 0,
      }}>
        <span style={{
          fontSize: 11, letterSpacing: '0.3em', color: '#555',
          fontFamily: 'system-ui, sans-serif', fontWeight: 700,
        }}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <span style={{ color: '#333', margin: '0 8px', fontSize: 11 }}>/</span>
        <span style={{
          fontSize: 11, letterSpacing: '0.3em', color: '#333',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {String(SYSTEM_COUNT).padStart(2, '0')}
        </span>
      </div>

      {/* ── Scroll hint — only on first load ── */}
      {activeIndex === 0 && (
        <div style={{
          position: 'fixed', bottom: 28, right: 24, zIndex: 100,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'float 2.5s ease-in-out infinite',
        }}>
          <span style={{
            fontSize: 9, letterSpacing: '0.4em', color: '#333',
            fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase',
          }}>Scroll</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>
      )}
    </>
  );
}
