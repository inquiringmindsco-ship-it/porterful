import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/Navbar'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { Footer } from '@/components/Footer'
import { InstallPrompt, IOSInstallInstructions } from '@/components/InstallPrompt'
import { ArtistModal } from '@/components/ArtistModal'
import { KeyboardShortcuts } from '@/lib/keyboard-shortcuts'
import Script from 'next/script'

export const metadata: Metadata = {
  title: {
    default: 'Porterful - Music + Merch for Independent Artists',
    template: '%s | Porterful'
  },
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman. Where artists own everything.',
  keywords: [
    'independent music',
    'artist merchandise',
    'music marketplace',
    'support artists',
    'buy music',
    'artist economy',
    'streaming alternative',
    'direct to fan',
    'music sales',
    'band merch',
    'independent artists',
    'music platform',
    'artist platform',
    'music download',
    'digital music'
  ],
  authors: [{ name: 'O D Porter', url: 'https://porterful.com' }],
  creator: 'Porterful',
  publisher: 'Porterful',
  metadataBase: new URL('https://porterful.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://porterful.com',
    siteName: 'Porterful',
    title: 'Porterful - Music + Merch for Independent Artists',
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman. Where artists own everything.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful - Music + Merch for Independent Artists',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful - Music + Merch for Independent Artists',
    description: 'Stream music, buy tracks, shop merch. 80% goes to artists.',
    creator: '@porterful',
    site: '@porterful',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    other: [
      { url: '/apple-touch-icon.png', rel: 'apple-touch-icon' }
    ]
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Porterful',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Porterful',
  url: 'https://porterful.com',
  logo: 'https://porterful.com/logo.svg',
  description: 'Stream music, buy tracks, shop merch. 80% goes to artists. No label. No middleman.',
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
    contactType: 'customer service',
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://porterful.com/digital?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

const webApplicationLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Porterful',
  url: 'https://porterful.com',
  description: 'Music and merchandise platform for independent artists. Stream music, buy tracks, shop merch. 80% goes to artists.',
  applicationCategory: 'Music',
  operatingSystem: 'Web Browser, iOS, Android',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Porterful',
    url: 'https://porterful.com',
  },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does Porterful help independent artists?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porterful lets independent artists sell music and merchandise directly to fans, keeping 80% of every sale. No label, no middleman, no complicated contracts.',
      },
    },
    {
      '@type': 'Question',
      name: 'How much do artists earn on Porterful?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Artists keep 80% of every sale. The platform takes 10%, and 10% goes into the artist fund. There are no monthly fees or upfront costs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I sell merchandise on Porterful?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Artists can sell print-on-demand merchandise through Porterful. We handle printing and shipping so you can focus on creating music.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Superfan program?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Superfan program lets fans earn rewards by sharing artists they love. Superfans get 3-10% commissions on sales made through their unique referral links.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Porterful only for musicians?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, Porterful is open to all independent artists, creators, and small businesses. We also support businesses and brands looking to reach artist audiences.',
      },
    },
  ],
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#f97316' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Porterful" />
        <meta name="application-name" content="Porterful" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body className="antialiased">
        {/* Skip to main content - accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[var(--pf-orange)] focus:text-white focus:rounded-lg focus:font-medium">
          Skip to main content
        </a>
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="webapplication-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationLd) }}
        />
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <Script src="/pwa.js" strategy="afterInteractive" />
        <Providers>
          <KeyboardShortcuts />
          <Navbar />
          <main id="main-content" className="min-h-screen pb-24 pt-16 md:pt-20">
            {children}
          </main>
          <Footer />
          <ArtistModal />
          <GlobalPlayer />
          <InstallPrompt />
          <IOSInstallInstructions />
        </Providers>
      </body>
    </html>
  )
}