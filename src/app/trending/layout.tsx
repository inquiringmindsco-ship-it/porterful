import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trending Products — Hot Merch Right Now',
  description: 'Discover trending products on Porterful. See what everyone is buying and support independent artists with every purchase.',
  keywords: ['trending products', 'hot merch', 'popular products', 'artist merchandise', 'independent artist merch'],
  openGraph: {
    title: 'Trending Products — Porterful',
    description: 'Discover trending independent artist merchandise.',
    images: ['/og-image.png'],
  },
}

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}