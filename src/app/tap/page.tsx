import type { Metadata } from 'next'
import { TapExperience } from '@/components/tap/TapExperience'
import { buildTapHref, getTapParams } from '@/lib/tap'
import { insertTapEvent } from '@/lib/tap-server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  metadataBase: new URL('https://porterful.com'),
  title: 'Tap | Porterful',
  description: 'Tap into a verified identity. Document your likeness, explore the system, and choose your next step.',
  openGraph: {
    title: 'Tap | Porterful',
    description: 'Tap into a verified identity. Document your likeness, explore the system, and choose your next step.',
    images: ['/og-image.png'],
  },
}

interface TapPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function TapPage({ searchParams }: TapPageProps) {
  const params = getTapParams(searchParams)

  await insertTapEvent({
    eventType: 'visit',
    path: '/tap',
    ref: params.ref ?? null,
    product: params.product ?? null,
    campaign: params.campaign ?? null,
  })

  return (
    <TapExperience
      mode="generic"
      pagePath="/tap"
      params={params}
      actions={[
        {
          label: 'Register My Likeness',
          href: buildTapHref('/register', params),
          eventType: 'register',
        },
        {
          label: 'View Store',
          href: buildTapHref('/store', params),
          eventType: 'store',
        },
        {
          label: 'Learn About Likeness',
          href: buildTapHref('/tap', params, 'learn'),
          eventType: 'learn',
        },
      ]}
      trustLines={[
        'Your likeness is personal',
        'Your record should be easy to create',
        'Your next step should be clear',
      ]}
      learnCards={[
        {
          title: 'Tap first, auth later',
          body: 'The tap surface never depends on dashboard state or sign-in. Discovery stays public.',
        },
        {
          title: 'Attribution stays attached',
          body: 'ref, product, and campaign values are carried through the button flow and into downstream routes.',
        },
        {
          title: 'Safe fallback always',
          body: 'If a profile is missing or inactive, the system falls back to this generic entry page instead of erroring.',
        },
      ]}
      disclaimer={"Tap-In helps fans reach your official Porterful page.\nIt does not prove legal ownership of a name, song, or likeness.\nUse it as a connection layer, not a legal claim."}
    />
  )
}

