import type { Metadata } from 'next'
import { HomeClient } from './HomeClient'

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://porterful.com/#website',
      url: 'https://porterful.com',
      name: 'Porterful',
      description: 'Music, merch, and direct support for independent artists.',
      publisher: { '@id': 'https://porterful.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://porterful.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://porterful.com/#organization',
      name: 'Porterful',
      url: 'https://porterful.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://porterful.com/logo.png',
      },
      sameAs: [
        'https://twitter.com/porterful',
        'https://instagram.com/od.porter',
        'https://youtube.com/@odporter',
        'https://discord.gg/porterful',
        'https://tiktok.com/@Porterful',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'support@porterful.com',
        contactType: 'Customer Support',
      },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://porterful.com/#webpage',
      url: 'https://porterful.com',
      name: 'Porterful — Music, Merch, and Direct Support',
      isPartOf: { '@id': 'https://porterful.com/#website' },
      description:
        'Music, merch, and direct support for independent artists. Upload your music, sell merch, and connect directly with fans.',
      about: {
        '@type': 'Thing',
        name: 'Independent Music Platform',
      },
      mainEntity: {
        '@type': 'WebSite',
        name: 'Porterful',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Porterful — Music, Merch, and Direct Support',
  description: 'Music, merch, and direct support for independent artists. Upload your music, sell merch, and connect directly with fans.',
  openGraph: {
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://porterful.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful — Where Artists Own Everything',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful — Where Artists Own Everything',
    description: 'Sell music and merch. Keep 80% of every sale. No label. No middleman.',
    images: ['https://porterful.com/og-image.png'],
    creator: '@odporter',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient />
    </>
  )
}
