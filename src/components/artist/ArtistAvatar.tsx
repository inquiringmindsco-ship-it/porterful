'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error' | 'empty'>(
    src?.trim() ? 'loading' : 'empty',
  )

  useEffect(() => {
    if (!src?.trim()) {
      setStatus('empty')
      return
    }

    setStatus('loading')
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
