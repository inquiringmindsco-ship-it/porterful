'use client'

import Link from 'next/link'
import { ArrowRight, Lightbulb } from 'lucide-react'

export type Stage = {
  label: string
  status: 'complete' | 'current' | 'pending' | 'blocked'
}

export type GuidanceSignal = {
  label: string
  value: string
  tone?: 'neutral' | 'success' | 'warning' | 'info'
}

export function StageTracker({ stages, title }: { stages: Stage[]; title?: string }) {
  const currentIndex = stages.findIndex((s) => s.status === 'current')
  const progress = currentIndex >= 0 ? ((currentIndex) / (stages.length - 1)) * 100 : 0

  return (
    <div className="pf-card p-5 space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-[var(--pf-orange)]" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--pf-text-secondary)]">
            {title}
          </h3>
        </div>
      )}

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-[var(--pf-surface)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--pf-orange)] transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-1 flex-wrap">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                stage.status === 'complete'
                  ? 'bg-green-500 border-green-500'
                  : stage.status === 'current'
                  ? 'bg-[var(--pf-orange)] border-[var(--pf-orange)] animate-pulse'
                  : stage.status === 'blocked'
                  ? 'bg-transparent border-[var(--pf-border)]'
                  : 'bg-transparent border-[var(--pf-text-muted)]/40'
              }`}
            />
            <span
              className={`text-[10px] uppercase tracking-wide text-center max-w-[80px] leading-tight ${
                stage.status === 'complete'
                  ? 'text-green-400'
                  : stage.status === 'current'
                  ? 'text-[var(--pf-orange)] font-semibold'
                  : stage.status === 'blocked'
                  ? 'text-[var(--pf-text-muted)]/50'
                  : 'text-[var(--pf-text-muted)]'
              }`}
            >
              {stage.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function NextStepCard({
  title,
  description,
  actionLabel,
  actionHref,
  variant = 'default',
}: {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  variant?: 'default' | 'warning' | 'success'
}) {
  const borderColor =
    variant === 'success'
      ? 'border-green-500/30'
      : variant === 'warning'
      ? 'border-amber-500/30'
      : 'border-[var(--pf-orange)]/30'
  const bgColor =
    variant === 'success'
      ? 'bg-green-500/5'
      : variant === 'warning'
      ? 'bg-amber-500/5'
      : 'bg-[var(--pf-orange)]/5'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-5 space-y-3`}>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-sm text-[var(--pf-text-muted)] mt-1">{description}</p>
      </div>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline"
        >
          {actionLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

export function GuidanceRoadmap({
  eyebrow = 'Guidance',
  title,
  description,
  currentStage,
  nextStep,
  signals = [],
  actionLabel,
  actionHref,
}: {
  eyebrow?: string
  title: string
  description: string
  currentStage: string
  nextStep: string
  signals?: GuidanceSignal[]
  actionLabel?: string
  actionHref?: string
}) {
  const toneClasses = {
    neutral: 'border-[var(--pf-border)] bg-[var(--pf-surface)] text-[var(--pf-text-muted)]',
    success: 'border-green-500/20 bg-green-500/10 text-green-300',
    warning: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    info: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
  } as const

  return (
    <div className="pf-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-[var(--pf-orange)]" />
        <span className="text-xs uppercase tracking-wide text-[var(--pf-text-secondary)]">
          {eyebrow}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[var(--pf-text-muted)]">{description}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--pf-text-muted)]">Current stage</p>
          <p className="mt-2 text-sm font-semibold text-[var(--pf-text)]">{currentStage}</p>
        </div>
        <div className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-[var(--pf-text-muted)]">Next required step</p>
          <p className="mt-2 text-sm font-semibold text-[var(--pf-text)]">{nextStep}</p>
        </div>
      </div>

      {signals.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.label}
              className={`rounded-xl border p-4 ${toneClasses[signal.tone || 'neutral']}`}
            >
              <p className="text-[11px] uppercase tracking-wide opacity-80">{signal.label}</p>
              <p className="mt-1 text-lg font-semibold text-[var(--pf-text)]">{signal.value}</p>
            </div>
          ))}
        </div>
      )}

      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--pf-orange)] hover:underline"
        >
          {actionLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  points,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  points?: { label: string; text: string }[]
}) {
  return (
    <div className="pf-card p-10 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-[var(--pf-surface)] flex items-center justify-center text-[var(--pf-text-muted)]">
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium">{title}</p>
        <p className="text-sm text-[var(--pf-text-muted)] mt-1 max-w-md mx-auto">{description}</p>
      </div>
      {points && points.length > 0 && (
        <div className="mx-auto max-w-2xl grid gap-3 text-left sm:grid-cols-3">
          {points.map((point) => (
            <div key={point.label} className="rounded-xl border border-[var(--pf-border)] bg-[var(--pf-surface)]/60 p-4">
              <p className="text-[11px] uppercase tracking-wide text-[var(--pf-text-muted)]">{point.label}</p>
              <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{point.text}</p>
            </div>
          ))}
        </div>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="pf-btn pf-btn-primary inline-flex items-center gap-2">
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

export function AttentionCard({
  count,
  label,
  href,
  severity = 'warning',
}: {
  count: number
  label: string
  href: string
  severity?: 'warning' | 'error' | 'info' | 'success'
}) {
  if (count === 0) return null

  const colorClass =
    severity === 'error'
      ? 'bg-red-500/10 border-red-500/20 text-red-400'
      : severity === 'info'
      ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
      : severity === 'success'
      ? 'bg-green-500/10 border-green-500/20 text-green-400'
      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'

  return (
    <Link
      href={href}
      className={`block rounded-xl border p-4 hover:opacity-80 transition-opacity ${colorClass}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold">{count}</span>
        <span className="text-sm">{label}</span>
        <ArrowRight size={16} className="ml-auto" />
      </div>
    </Link>
  )
}
