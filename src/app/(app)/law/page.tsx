'use client'

import Link from 'next/link'
import { Scale, Zap, Shield, Users, FileText, ArrowRight, Clock, CheckCircle, Briefcase, Lightbulb } from 'lucide-react'

export default function LawPage() {
  return (
    <div className="min-h-screen pb-24">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--pf-orange)]/5 via-[var(--pf-bg)] to-[var(--pf-bg)]">
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, var(--pf-orange) 0%, transparent 50%), radial-gradient(circle at 70% 50%, #6366f1 0%, transparent 50%)',
        }} />

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Scale size={14} />
            Porterful Law — Legal Innovation
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Legal infrastructure<br />
            <span className="text-[var(--pf-orange)]">for builders.</span>
          </h1>

          <p className="text-xl text-[var(--pf-text-secondary)] max-w-2xl mx-auto mb-10">
            Ideas without protection are just possibilities. We help you lock them down — then build them out. 80/20. No upfront. We do what you can't. You do what you can.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/law/intern"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-full hover:bg-[var(--pf-orange-dark)] transition-colors text-lg"
            >
              Join the Program <ArrowRight size={18} />
            </Link>
            <Link
              href="/law/legal-docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-surface)] border border-[var(--pf-border)] text-[var(--pf-text-secondary)] font-medium rounded-full hover:border-[var(--pf-orange)]/40 hover:text-[var(--pf-text)] transition-colors"
            >
              Generate Legal Docs <FileText size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* THREE PILLARS */}
      <section className="border-y border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-[var(--pf-orange)]/10 flex items-center justify-center mx-auto mb-4">
                <Lightbulb size={24} className="text-[var(--pf-orange)]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Have an Idea?</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Bring it to us. If it's worth exploring, we bring our lawyers, our infrastructure, our reach — and we build it together.</p>
            </div>
            <div className="p-6 border-x border-[var(--pf-border)]">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                <Briefcase size={24} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Need a Lawyer?</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">We're building a network of startup-fluent attorneys who believe in what we're building — and work on contingency when it makes sense.</p>
            </div>
            <div className="p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Intern Program</h3>
              <p className="text-sm text-[var(--pf-text-secondary)]">Real work. Real experience. Real credits. We bring in the next generation of founders, operators, and operators — and get them in the room.</p>
            </div>
          </div>
        </div>
      </section>

      {/* LAWYER PROGRAM */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-blue-400 mb-2">The Lawyer Program</p>
          <h2 className="text-3xl font-bold">Attorneys who bet on founders</h2>
          <p className="text-[var(--pf-text-secondary)] max-w-xl mx-auto mt-3">
            We're building a network of lawyers who want skin in the game. Not hourly billing. Not billable hours. Equity-backed, founder-aligned legal counsel — for the ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="p-8 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)]">
            <h3 className="font-bold text-xl mb-4">The Problem</h3>
            <ul className="space-y-3 text-sm text-[var(--pf-text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                Startups get squeezed by legal fees before they even launch
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                Lawyers bill by the hour — hours disappear, money disappears
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                Most startup lawyers aren't built for the reality of 0-to-1
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">✗</span>
                Founders sign bad NDAs, bad contracts, bad terms — because they can't afford to ask
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-2xl bg-gradient-to-br from-[var(--pf-orange)]/10 to-blue-500/5 border border-[var(--pf-orange)]/20">
            <h3 className="font-bold text-xl mb-4">The Porterful Way</h3>
            <ul className="space-y-3 text-sm text-[var(--pf-text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                80/20 split — lawyers own 20% of the founders they represent
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                No upfront. Lawyers win when founders win.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                We do the work founders can't — filings, structuring, contracts, IP
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                Founders do what they can — build, create, sell, ship
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] p-8">
          <h3 className="font-bold text-xl mb-6">How it works</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold">1</div>
              <div>
                <h4 className="font-medium mb-1">Founder brings an idea</h4>
                <p className="text-sm text-[var(--pf-text-secondary)]">You have a concept, a product, a vision. Something worth protecting and building.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold">2</div>
              <div>
                <h4 className="font-medium mb-1">We match you with a lawyer</h4>
                <p className="text-sm text-[var(--pf-text-secondary)]">Our network of startup-fluent attorneys reviews your brief and decides if they're in. If yes — we structure a deal that works for both sides.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold">3</div>
              <div>
                <h4 className="font-medium mb-1">Lawyer does the work. Founder builds.</h4>
                <p className="text-sm text-[var(--pf-text-secondary)]">The lawyer handles filings, NDAs, operating agreements, IP strategy. The founder focuses on what only they can do.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold">4</div>
              <div>
                <h4 className="font-medium mb-1">80/20 split. Win together.</h4>
                <p className="text-sm text-[var(--pf-text-secondary)]">When the company grows, the lawyer's 20% stake grows. No hourly billing. No billable hours. Aligned incentives from day one.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LEGAL DOCS */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-widest text-purple-400 mb-2">Instant Legal Docs</p>
            <h2 className="text-3xl font-bold">The on-demand legal system</h2>
            <p className="text-[var(--pf-text-secondary)] max-w-xl mx-auto mt-3">
              NDAs, non-competes, partnership agreements, invention assignments — generated in seconds. No lawyer required for the basics. Built for founders who move fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'NDA',
                desc: 'Mutual or one-way. Instant PDF. Customize parties, scope, and jurisdiction.',
                color: 'blue',
                href: '/law/legal-docs?doc=nda',
              },
              {
                icon: Shield,
                title: 'Non-Compete',
                desc: 'Protect your market. Set territory, duration, and scope. State-compliant.',
                color: 'purple',
                href: '/law/legal-docs?doc=non-compete',
              },
              {
                icon: Users,
                title: 'Partnership Agreement',
                desc: 'Equity splits, roles, decision-making. Set it up right before things get complicated.',
                color: 'green',
                href: '/law/legal-docs?doc=partnership',
              },
              {
                icon: Lightbulb,
                title: 'Invention Assignment',
                desc: 'Who owns what. Essential for co-founders, contractors, and employees.',
                color: 'orange',
                href: '/law/legal-docs?doc=invention-assignment',
              },
              {
                icon: Zap,
                title: 'Founder Agreement',
                desc: 'The big one. Vesting, roles, exit clauses. Everything you need before you incorporate.',
                color: 'yellow',
                href: '/law/legal-docs?doc=founder-agreement',
              },
              {
                icon: Clock,
                title: 'More Coming',
                desc: 'Service agreements, licensing contracts, ghostwriting agreements. We keep building.',
                color: 'gray',
                href: '/law/legal-docs',
              },
            ].map(({ icon: Icon, title, desc, color, href }) => (
              <Link
                key={title}
                href={href}
                className="group p-6 rounded-2xl bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  color === 'blue' ? 'bg-blue-500/10' :
                  color === 'purple' ? 'bg-purple-500/10' :
                  color === 'green' ? 'bg-green-500/10' :
                  color === 'orange' ? 'bg-[var(--pf-orange)]/10' :
                  color === 'yellow' ? 'bg-yellow-500/10' :
                  'bg-gray-500/10'
                }`}>
                  <Icon size={22} className={
                    color === 'blue' ? 'text-blue-400' :
                    color === 'purple' ? 'text-purple-400' :
                    color === 'green' ? 'text-green-400' :
                    color === 'orange' ? 'text-[var(--pf-orange)]' :
                    color === 'yellow' ? 'text-yellow-400' :
                    'text-gray-400'
                  } />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--pf-orange)] transition-colors">{title}</h3>
                <p className="text-sm text-[var(--pf-text-secondary)]">{desc}</p>
                <div className="mt-4 text-sm text-[var(--pf-orange)] font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Generate <ArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* INTERNSHIP CTA */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="rounded-3xl bg-gradient-to-br from-[var(--pf-orange)]/10 via-[var(--pf-bg)] to-purple-500/5 border border-[var(--pf-orange)]/20 p-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <Users size={14} />
              Porterful Internship Program
            </div>
            <h2 className="text-3xl font-bold mb-4">Real work. Real experience. Real credits.</h2>
            <p className="text-[var(--pf-text-secondary)] max-w-xl mx-auto mb-8">
              We bring in the next generation of builders. You want in? Get in the room. Work on real products, real deals, real problems. School credit or portfolio credit — either way, you ship.
            </p>
            <Link
              href="/law/intern"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-full hover:bg-[var(--pf-orange-dark)] transition-colors text-lg"
            >
              Apply for Internship <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-[var(--pf-border)]">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold mb-4">Have an idea worth exploring?</h2>
          <p className="text-xl text-[var(--pf-text-secondary)] max-w-xl mx-auto mb-10">
            Bring it to us. If it's real, we bring the infrastructure. Lawyers, capital, distribution, systems. You bring the vision. Let's see what we can build.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--pf-orange)] text-white font-bold rounded-full hover:bg-[var(--pf-orange-dark)] transition-colors text-lg"
            >
              Apply to the Program <ArrowRight size={18} />
            </Link>
            <Link
              href="/law/legal-docs"
              className="inline-flex items-center gap-2 px-6 py-3 text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors"
            >
              Generate Legal Docs <FileText size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
