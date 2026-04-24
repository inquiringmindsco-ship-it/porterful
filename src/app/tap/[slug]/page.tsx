import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { TapExperience } from '@/components/tap/TapExperience'
import { buildTapHref, getTapParams, normalizeTapSlug, sanitizeTapImageUrl } from '@/lib/tap'
import {
  allowTapRequest,
  getTapRequestIp,
  fetchTapProfile,
  insertTapEvent,
  resolveTapEffectiveParams,
  resolveTapPrimaryActionHref,
  resolveTapProductLabel,
} from '@/lib/tap-server'

export const dynamic = 'force-dynamic'

interface TapSlugPageProps {
  params: Promise<{ slug: string }>
  searchParams?: Record<string, string | string[] | undefined>
}

export async function generateMetadata({ params }: TapSlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const normalizedSlug = normalizeTapSlug(slug)
  const profile = normalizedSlug ? await fetchTapProfile(normalizedSlug) : null

  if (!profile || !profile.is_active) {
    return {
      metadataBase: new URL('https://porterful.com'),
      title: 'Tap | Porterful',
      description: 'Tap into a verified identity. Document your likeness, explore the system, and choose your next step.',
    }
  }

  const productLabel = resolveTapProductLabel(profile, { product: profile.primary_product_id || undefined })

  return {
    metadataBase: new URL('https://porterful.com'),
    title: `${profile.display_name} | Tap`,
    description: productLabel
      ? `${profile.display_name} tap profile. Featured product: ${productLabel}.`
      : `${profile.display_name} tap profile.`,
    openGraph: {
      title: `${profile.display_name} | Tap`,
      description: productLabel
        ? `${profile.display_name} tap profile. Featured product: ${productLabel}.`
        : `${profile.display_name} tap profile.`,
      images: profile.hero_image_url ? [{ url: profile.hero_image_url }] : ['/og-image.png'],
    },
  }
}

export default async function TapSlugPage({ params, searchParams }: TapSlugPageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeTapSlug(slug)
  const paramsFromUrl = getTapParams(searchParams)

  if (!normalizedSlug) {
    redirect(buildTapHref('/tap', paramsFromUrl))
  }

  if (normalizedSlug !== slug) {
    redirect(buildTapHref(`/tap/${normalizedSlug}`, paramsFromUrl))
  }

  const requestIp = getTapRequestIp(headers())
  if (!allowTapRequest('tap-page', requestIp)) {
    redirect(buildTapHref('/tap', paramsFromUrl))
  }

  const profile = await fetchTapProfile(normalizedSlug)

  if (!profile || !profile.is_active) {
    redirect(buildTapHref('/tap', paramsFromUrl))
  }

  const effectiveParams = resolveTapEffectiveParams(profile, paramsFromUrl)
  const heroImageUrl = sanitizeTapImageUrl(profile.hero_image_url)
  const productLabel = resolveTapProductLabel(profile, effectiveParams)
  const primaryActionHref = resolveTapPrimaryActionHref(profile, effectiveParams)

  await insertTapEvent({
    eventType: 'visit',
    path: `/tap/${profile.slug}`,
    slug: profile.slug,
    ref: effectiveParams.ref ?? null,
    product: effectiveParams.product ?? null,
    campaign: effectiveParams.campaign ?? null,
  })

  return (
    <TapExperience
      mode="personal"
      pagePath={`/tap/${profile.slug}`}
      params={effectiveParams}
      displayName={profile.display_name}
      heroImageUrl={heroImageUrl}
      productLabel={productLabel}
      actions={[
        {
          label: 'Get This Shirt',
          href: primaryActionHref,
          eventType: 'store',
        },
        {
          label: 'Register Your Likeness',
          href: buildTapHref('/register', effectiveParams),
          eventType: 'register',
        },
        {
          label: 'Learn About Likeness',
          href: buildTapHref(`/tap/${profile.slug}`, effectiveParams, 'learn'),
          eventType: 'learn',
        },
      ]}
      trustLines={[
        'Public view only',
        'Safe links only',
        'Fallback stays generic if the profile is disabled',
      ]}
      learnCards={[
        {
          title: 'Public fields only',
          body: 'This route shows just the image, display name, product, and validated outbound links.',
        },
        {
          title: 'Profile driven',
          body: 'The personal route always tries to load a tap profile first. Missing or inactive profiles go back to /tap.',
        },
        {
          title: 'Attribution persists',
          body: 'Incoming ref, product, and campaign values stay attached as the tap moves into the next step.',
        },
      ]}
      disclaimer="Documentation and registration only. No legal ownership, protection, or insurance is promised here."
    />
  )
}
