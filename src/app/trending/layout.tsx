import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Trending - Hot Music Now',
  description: 'Discover trending music on Porterful. See what other fans are listening to and support independent artists on the rise.',
  keywords: ['trending music', 'hot music', 'popular music', 'top charts', 'independent music charts'],
  openGraph: {
    title: 'Trending - Porterful',
    description: 'Discover trending independent music.',
    images: ['/og-image.png'],
  },
}

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}