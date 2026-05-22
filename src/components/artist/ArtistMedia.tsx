'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

type ArtistMediaVariant = 'avatar' | 'banner' | 'card'

interface ArtistMediaProps {
  src?: string | null
  alt: string
  name?: string
  variant?: ArtistMediaVariant
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes?: string
}

function getInitials(name?: string) {
  if (!name) return 'P'
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return 'P'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function PorterfulPlaceholder({ variant, name }: { variant: ArtistMediaVariant; name?: string }) {
  const initials = getInitials(name)
  const isBanner = variant === 'banner'
  const logoSize = isBanner ? 56 : variant === 'card' ? 40 : 28

  return (
    <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(198,167,94,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,#121212,#070707)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_45%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.42))]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`flex flex-col items-center justify-center text-center ${isBanner ? 'gap-2 px-6' : 'gap-0 px-2'}`}>
          <div className="relative flex items-center justify-center">
            <div
              className={`flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_18px_40px_rgba(0,0,0,0.35)] ${
                isBanner ? 'h-20 w-20' : variant === 'card' ? 'h-12 w-12' : 'h-10 w-10'
              }`}
            >
              <Image
                src="/brand/porterful/porterful_official_p_flat_gold.png"
                alt=""
                width={logoSize}
                height={logoSize}
                className="object-contain"
                aria-hidden="true"
              />
            </div>
            {!isBanner && (
              <span className="absolute -bottom-1 -right-1 rounded-full border border-white/10 bg-black/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80">
                {initials}
              </span>
            )}
          </div>
          {isBanner && (
            <div className="flex flex-col items-center gap-1">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/80">
                Porterful
              </span>
              {name && <p className="max-w-full truncate text-sm font-medium text-white/70">{name}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ArtistMedia({
  src,
  alt,
  name,
  variant = 'card',
  className = '',
  imageClassName = '',
  priority = false,
  sizes,
}: ArtistMediaProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>(
    src?.trim() ? 'loading' : 'empty',
  )

  useEffect(() => {
    if (!src?.trim()) {
      setStatus('empty')
      return
    }

    let active = true
    setStatus('loading')

    const probe = new window.Image()
    probe.onload = () => {
      if (active) setStatus('loaded')
    }
    probe.onerror = () => {
      if (active) setStatus('error')
    }
    probe.src = src

    return () => {
      active = false
    }
  }, [src])

  const showImage = status === 'loaded' && !!src?.trim()
  const wrapperClassName = useMemo(() => {
    const base = 'relative overflow-hidden'
    return `${base} ${className}`.trim()
  }, [className])

  return (
    <div className={wrapperClassName}>
      {showImage ? (
        <img
          src={src!}
          alt={alt}
          className={`absolute inset-0 h-full w-full ${imageClassName || 'object-cover'}`}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
        />
      ) : (
        <PorterfulPlaceholder variant={variant} name={name} />
      )}
    </div>
  )
}
