'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface LikenessInfoModalProps {
  open: boolean
  onClose: () => void
}

export function LikenessInfoModal({ open, onClose }: LikenessInfoModalProps) {
  const [shouldRender, setShouldRender] = useState(open)
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      requestAnimationFrame(() => setVisible(true))
      return
    }

    setVisible(false)
    const timeout = window.setTimeout(() => setShouldRender(false), 220)
    return () => window.clearTimeout(timeout)
  }, [open])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center px-4 transition-opacity duration-200 ease-out ${visible ? 'opacity-100' : 'opacity-0'} bg-black/55 backdrop-blur-sm`}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="likeness-info-title"
        className={`w-full max-w-md rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-5 shadow-2xl transition-all duration-200 ease-out will-change-transform ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="likeness-info-title" className="text-lg font-semibold text-[var(--pf-text)]">
              What is Likeness™?
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--pf-text-muted)] transition-colors hover:bg-[var(--pf-bg)] hover:text-[var(--pf-text)]"
            aria-label="Close info"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--pf-text-secondary)]">
          <p>
            Likeness™ is a system that lets you document your identity and access it instantly.
          </p>
          <p>
            It gives you a recorded reference for your presence — across platforms, profiles,
            and real-world signals like tap-enabled products.
          </p>
          <p>
            It is not a social app. It is not a job. It is not legal ownership.
          </p>
          <p>
            It is something you have.
          </p>
        </div>
      </div>
    </div>
  )
}
