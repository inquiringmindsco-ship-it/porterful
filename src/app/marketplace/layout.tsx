import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop | Porterful — Official Artist Merch & Music',
  description: 'Shop official Porterful merchandise — apparel, tech, home goods, and music from independent artists. Free shipping on orders $50+. 80% of proceeds support artists.',
  keywords: ['artist merch', 'shop', 'print on demand', 't-shirts', 'music merchandise', 'artist store'],
  alternates: {
    canonical: 'https://porterful.com/shop',
  },
  openGraph: {
    title: 'Shop | Porterful',
    description: 'Official Porterful merch — your purchase supports independent artists. Free shipping on orders $50+.',
    url: 'https://porterful.com/shop',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop | Porterful',
    description: 'Official Porterful merch — your purchase supports independent artists.',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
