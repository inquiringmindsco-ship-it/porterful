'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'My Vault', href: '/dashboard' },
  { label: 'Social', href: '/dashboard/dashboard/likeness' },
  { label: 'Access', href: '/dashboard/dashboard/access' },
]

const ACCESS_STEPS = [
  'Register your likeness',
  'Connect your profiles and signal',
  'Receive opportunities tied to your presence',
]

const OPPORTUNITIES = [
  'Support from others',
  'Collaborations',
  'Promotion opportunities',
  'Requests to share or feature content',
]

const NOTIFICATIONS = [
  'Email notifications',
  'Activity alerts',
  'Or no notifications at all',
]

export default function AccessPage() {
  const pathname = usePathname()

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Tab Nav */}
        <nav className="flex gap-1 mb-8 border-b border-[var(--pf-border)]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                pathname === n.href
                  ? 'border-[var(--pf-orange)] text-[var(--pf-text)]'
                  : 'border-transparent text-[var(--pf-text-muted)] hover:text-[var(--pf-text)]'
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <section className="rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Access</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-bold leading-tight">
            Access opportunities connected to your likeness.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            As a registrant, you can receive opportunities, requests, and support through your profile and signal.
          </p>
          <div className="mt-6">
            <Link
              href="/verify"
              className="inline-flex items-center justify-center rounded-xl bg-[var(--pf-orange)] px-5 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[var(--pf-orange-light)]"
            >
              Register to Access
            </Link>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">How access works</p>
          <h2 className="mt-2 text-2xl font-bold">How access works</h2>
          <ol className="mt-4 space-y-3">
            {ACCESS_STEPS.map((step, index) => (
              <li key={step} className="flex items-start gap-3 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] p-4">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--pf-orange)] text-sm font-semibold text-[#111111]">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-[var(--pf-text)]">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Opportunities, not promises</p>
          <h2 className="mt-2 text-2xl font-bold">Opportunities, not promises</h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            Likeness™ connects you to opportunities based on your presence, activity, and connections.
          </p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-[var(--pf-text)]">This can include:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {OPPORTUNITIES.map((item) => (
                <li key={item} className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3 text-sm text-[var(--pf-text-secondary)]">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-sm text-[var(--pf-text-muted)]">
            Participation is optional. Results vary based on how you use your signal.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Stay in control</p>
          <h2 className="mt-2 text-2xl font-bold">Stay in control</h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            Choose how you receive updates:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--pf-text-secondary)]">
            {NOTIFICATIONS.map((item) => (
              <li key={item} className="rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-4 py-3">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--pf-text-muted)]">
            You control what reaches you.
          </p>
        </section>

        <section className="mt-6 rounded-3xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--pf-orange)]">Built on mutual benefit</p>
          <h2 className="mt-2 text-2xl font-bold">Built on mutual benefit</h2>
          <p className="mt-4 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            Likeness™ enables connections where value flows both ways.
          </p>
          <p className="mt-3 max-w-2xl text-base text-[var(--pf-text-secondary)]">
            People can support, promote, or connect with you, and you choose how to engage.
          </p>
        </section>
      </div>
    </div>
  )
}
