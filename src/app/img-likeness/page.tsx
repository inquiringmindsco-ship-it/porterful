import type { ElementType, ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, BarChart3, Building2, CalendarDays, MapPinned, ShieldCheck, Sparkles, Users, Boxes } from 'lucide-react'

const whyStLouis = [
  'Central position between Chicago, Kansas City, Dallas-Fort Worth, and New Orleans.',
  'Practical base for storage, coordination, and business operations.',
  'Founder leadership maintains longstanding ties to the region.',
]

const hq1Uses = [
  {
    label: 'Storage',
    text: 'Inventory, equipment, and overflow holdings.',
  },
  {
    label: 'Fulfillment',
    text: 'Packing, shipping, receiving, and coordination.',
  },
  {
    label: 'HQ Administration',
    text: 'Tenant communication, scheduling, and records.',
  },
  {
    label: 'Programming',
    text: 'Workshops, vendor activity, and controlled events.',
  },
]

const ecosystem = [
  {
    label: 'Verification',
    text: 'Trusted identity and registry linkage.',
  },
  {
    label: 'Commerce',
    text: 'Creator sales and practical business activity.',
  },
  {
    label: 'Production',
    text: 'Media, content, and workflow support.',
  },
  {
    label: 'Activation',
    text: 'Community-facing use with measured execution.',
  },
]

const revenue = [
  {
    label: 'Space',
    text: 'Storage and workspace use.',
  },
  {
    label: 'Fulfillment',
    text: 'Receiving, packing, and distribution support.',
  },
  {
    label: 'Programming',
    text: 'Workshops, meetings, and vendor events.',
  },
  {
    label: 'Services',
    text: 'Business support and operational coordination.',
  },
]

const cases = [
  {
    label: 'Proposal Package',
    text: 'A landlord-facing occupancy plan built around a real building, a real operator, and a conservative lease structure.',
  },
  {
    label: 'Operating Systems',
    text: 'Existing systems for business development, storage, fulfillment, and administration already in motion.',
  },
  {
    label: 'Regional Demand',
    text: 'Identified need across St. Louis, Chicago, Kansas City, Dallas-Fort Worth, and New Orleans.',
  },
]

const proofMetrics = [
  {
    label: 'UEI',
    value: 'QR19FK13MZN8',
  },
  {
    label: 'CAGE',
    value: '12RU1',
  },
  {
    label: 'Entity',
    value: 'Inquiring Minds LLC',
  },
  {
    label: 'Website',
    value: 'imglikeness.com',
  },
  {
    label: 'Region',
    value: '5 cities',
  },
  {
    label: 'Asset Base',
    value: '2 primary visuals',
  },
]

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.32em] text-[#c9a96e]">
      {children}
    </div>
  )
}

function VisualFrame({
  label,
  src,
  alt,
  caption,
  priority = false,
  imageClassName = '',
}: {
  label: string
  src: string
  alt: string
  caption: string
  priority?: boolean
  imageClassName?: string
}) {
  return (
    <figure className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <div className="px-5 pt-4 text-[0.7rem] uppercase tracking-[0.3em] text-white/60">{label}</div>
      <div className="relative mt-4 h-[20rem] overflow-hidden bg-black sm:h-[24rem]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 40vw, 90vw"
          className={`object-cover ${imageClassName}`}
        />
      </div>
      <figcaption className="px-5 py-4 text-sm leading-6 text-white/72">{caption}</figcaption>
    </figure>
  )
}

function CopyCard({
  icon: Icon,
  label,
  text,
}: {
  icon: ElementType
  label: string
  text: string
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c9a96e]/30 bg-[#c9a96e]/10 text-[#c9a96e]">
          <Icon size={18} />
        </div>
        <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">{label}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/68">{text}</p>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[0.68rem] uppercase tracking-[0.28em] text-white/50">{label}</div>
      <div className="mt-3 text-xl font-semibold tracking-[-0.02em] text-white">{value}</div>
    </div>
  )
}

export default function ImgLikenessPage() {
  return (
    <main
      className="min-h-screen bg-[#090a0f] text-[#f5f1ea]"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,169,110,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_26%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090a0f]/88 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#c9a96e]">
            IMG x Likeness
          </Link>
          <nav className="hidden items-center gap-6 text-[0.68rem] uppercase tracking-[0.28em] text-white/48 md:flex">
            <a href="#present" className="transition-colors hover:text-white">
              Present → Future
            </a>
            <a href="#stl" className="transition-colors hover:text-white">
              Why St. Louis
            </a>
            <a href="#proof" className="transition-colors hover:text-white">
              Proof Metrics
            </a>
          </nav>
        </div>
      </header>

      <section id="hero" className="relative">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-14">
          <div className="order-2 max-w-xl lg:order-1">
            <SectionLabel>HQ-1 / Physical Operations</SectionLabel>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
              Build the headquarters before the explanation.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-white/68 sm:text-lg">
              IMG x Likeness uses a real building in St. Louis to anchor creator commerce, verification services,
              content production, and long-term operations.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#present"
                className="inline-flex items-center gap-2 rounded-full bg-[#c9a96e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#111111] transition-transform hover:-translate-y-0.5"
              >
                See the building
                <ArrowRight size={14} />
              </a>
              <a
                href="#proof"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/82 transition-transform hover:-translate-y-0.5 hover:border-white/24"
              >
                Proof metrics
              </a>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-xs uppercase tracking-[0.2em] text-white/55">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">Current Property</div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">HQ-1 Vision</div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">St. Louis Base</div>
            </div>
          </div>

          <div className="order-1 grid gap-4 md:grid-cols-2 lg:order-2 lg:grid-cols-1">
            <VisualFrame
              priority
              label="Current Property"
              src="/img-likeness/current-property.jpg"
              alt="Current property at 1724 N. 13th Street"
              caption="The property located at 1724 N. 13th Street represents the proposed location for HQ-1, the first physical operations hub of IMG x Likeness."
              imageClassName="rotate-[-90deg] scale-[1.38] origin-center"
            />
            <VisualFrame
              label="HQ-1 Vision"
              src="/img-likeness/hq1-vision.png"
              alt="HQ-1 concept rendering"
              caption="The concept render shows the long-term vision for HQ-1 as a center for creator commerce, verification services, content production, workforce development, and community activation."
            />
          </div>
        </div>
      </section>

      <section id="present" className="relative border-t border-white/10 bg-[#0f1116]/90">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <SectionLabel>Present → Future</SectionLabel>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_0.92fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <VisualFrame
              label="Current Property"
              src="/img-likeness/current-property.jpg"
              alt="Current property at 1724 N. 13th Street"
              caption="Reality: a real building with a real location and a real operational path."
              imageClassName="rotate-[-90deg] scale-[1.38] origin-center"
            />
              <VisualFrame
                label="HQ-1 Vision"
                src="/img-likeness/hq1-vision.png"
                alt="HQ-1 concept rendering"
                caption="Future: a headquarters image that makes the operating model visible at a glance."
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 lg:p-8">
              <div className="text-sm uppercase tracking-[0.25em] text-[#c9a96e]">From property to headquarters</div>
              <p className="mt-5 text-base leading-8 text-white/72">
                The property located at 1724 N. 13th Street represents the proposed location for HQ-1, the first
                physical operations hub of IMG x Likeness.
              </p>
              <p className="mt-4 text-base leading-8 text-white/72">
                The image on the left reflects the current property. The image on the right illustrates the long-term
                vision for HQ-1 as a center for creator commerce, verification services, content production, workforce
                development, and community activation.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/62">
                Reality → transformation. Today → tomorrow.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="stl" className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>Why St. Louis</SectionLabel>
          <div className="mt-5 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                A central base for regional operations.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-white/68">
                St. Louis is the natural location for HQ-1 because it sits between IMG’s existing relationships in
                Chicago, Kansas City, Dallas-Fort Worth, and New Orleans, and founder leadership maintains longstanding
                ties to the region.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {whyStLouis.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/72">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="hq1" className="relative border-t border-white/10 bg-[#0f1116]/90">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>HQ-1</SectionLabel>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {hq1Uses.map((item) => (
              <CopyCard key={item.label} icon={Building2} label={item.label} text={item.text} />
            ))}
          </div>
        </div>
      </section>

      <section id="ecosystem" className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>Ecosystem</SectionLabel>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ecosystem.map((item, index) => {
              const icons = [BadgeCheck, Sparkles, Users, ShieldCheck] as const
              const Icon = icons[index] ?? BadgeCheck
              return <CopyCard key={item.label} icon={Icon} label={item.label} text={item.text} />
            })}
          </div>
        </div>
      </section>

      <section id="revenue" className="relative border-t border-white/10 bg-[#0f1116]/90">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>Revenue</SectionLabel>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {revenue.map((item, index) => {
              const icons = [Boxes, CalendarDays, BarChart3, ArrowRight] as const
              const Icon = icons[index] ?? Boxes
              return <CopyCard key={item.label} icon={Icon} label={item.label} text={item.text} />
            })}
          </div>
        </div>
      </section>

      <section id="cases" className="relative border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>Case Studies</SectionLabel>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {cases.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm font-semibold uppercase tracking-[0.22em] text-[#c9a96e]">{item.label}</div>
                <p className="mt-4 text-sm leading-7 text-white/68">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="relative border-t border-white/10 bg-[#0f1116]/90">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <SectionLabel>Proof Metrics</SectionLabel>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {proofMetrics.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-6 py-8 text-center text-[0.68rem] uppercase tracking-[0.28em] text-white/40">
        IMG x Likeness · HQ-1 Visual Direction
      </footer>
    </main>
  )
}
