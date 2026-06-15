'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ArtistAvatarShape, ArtistAvatarFocus } from '@/lib/artist-theme'

type ArtistAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ArtistAvatarProps {
  src?: string | null
  alt?: string
  name: string
  size?: ArtistAvatarSize
  shape?: ArtistAvatarShape
  focus?: ArtistAvatarFocus
  objectPosition?: string
  className?: string
  imageClassName?: string
  priority?: boolean
  sizes?: string
  title?: string
}

const SIZE_CLASSES: Record<ArtistAvatarSize, string> = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-14 w-14 text-sm',
  xl: 'h-40 w-40 text-xl',
}

const SHAPE_CLASSES: Record<ArtistAvatarShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-lg',
  'rounded-square': 'rounded-2xl',
}

function getObjectPosition(focus?: ArtistAvatarFocus, objectPosition?: string) {
  if (focus === 'manual' && objectPosition?.trim()) return objectPosition.trim()
  if (focus === 'top-focus') return '50% 18%'
  return objectPosition?.trim() || '50% 42%'
}

function getInitials(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length === 0) return 'P'
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

export function ArtistAvatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  focus = 'center-face',
  objectPosition,
  className = '',
  imageClassName = '',
  priority = false,
  sizes,
  title,
}: ArtistAvatarProps) {
  // If the image is already cached or already finished loading by the time React mounts,
  // imgRef.current.complete will be true and we should set status to 'loaded' immediately
  // to avoid the opacity-0 flash. We also re-check on every src change for the same reason.
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>(
    () => {
      if (!src?.trim()) return 'empty'
      if (typeof window === 'undefined') return 'loading'
      try {
        const probe = new window.Image()
        probe.src = src
        return probe.complete ? 'loaded' : 'loading'
      } catch {
        return 'loading'
      }
    },
  )

  useEffect(() => {
    if (!src?.trim()) {
      setStatus('empty')
      return
    }

    setStatus('loading')

    // If the image is already in the browser cache (or the same-origin relative
    // path already finished loading before React attached the onLoad listener),
    // mark it loaded immediately. Otherwise the opacity-0 hides the image forever
    // and the user sees a blank hero.
    const checkLoaded = () => {
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setStatus('loaded')
      }
    }

    // Run after layout: imgRef is attached by then.
    const raf = requestAnimationFrame(checkLoaded)
    return () => cancelAnimationFrame(raf)
  }, [src])

  const initials = useMemo(() => getInitials(name || 'Porterful'), [name])
  const altText = alt?.trim() || `${name} profile avatar`
  const canRenderImage = !!src?.trim() && status !== 'error'

  return (
    <div
      className={[
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[var(--pf-border)]',
        'bg-[var(--pf-surface)]',
        'text-[var(--pf-text)] shadow-[0_12px_32px_rgba(0,0,0,0.24)] ring-1 ring-[var(--pf-border)]',
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        className,
      ].join(' ')}
      title={title || altText}
      aria-label={altText}
    >
      {canRenderImage ? (
        <img
          ref={imgRef}
          src={src!}
          alt={altText}
          className={[
            'absolute inset-0 h-full w-full object-cover transition-opacity duration-200',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imageClassName,
          ].filter(Boolean).join(' ')}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          style={{ objectPosition: getObjectPosition(focus, objectPosition) }}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--pf-surface)]">
          <span className="font-semibold uppercase tracking-[0.16em] text-[var(--pf-text)]">{initials}</span>
        </div>
      )}
    </div>
  )
}
