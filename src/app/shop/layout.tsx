import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Store - Official Artist Merchandise',
  description: 'Browse official merchandise from your favorite independent artists. T-shirts, hoodies, vinyl, posters, and more. 80% goes directly to artists.',
  keywords: ['artist merchandise', 'band merch', 'music merch', 'vinyl', 't-shirts', 'hoodies', 'independent artist merch', 'artist shop'],
  alternates: {
    canonical: 'https://porterful.com/shop',
  },
  openGraph: {
    title: 'Store - Porterful',
    description: 'Official artist merchandise. Support independent artists directly.',
    images: ['/og-image.png'],
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}