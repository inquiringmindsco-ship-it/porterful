import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Merch - Official Artist Merchandise',
  description: 'Browse official merchandise from your favorite independent artists. T-shirts, hoodies, vinyl, and more. 80% goes directly to artists.',
  keywords: ['artist merchandise', 'band merch', 'music merch', 'vinyl', 't-shirts', 'hoodies', 'independent artist merch'],
  openGraph: {
    title: 'Shop Merch - Porterful',
    description: 'Official artist merchandise. Support independent artists directly.',
    images: ['/og-image.png'],
  },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}