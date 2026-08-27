import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Store',
  description: 'Shop music, merch, and products from independent creators. Live products available now. Preview products coming soon.',
  alternates: {
    canonical: 'https://porterful.com/shop',
  },
  openGraph: {
    title: 'Store | Porterful',
    description: 'Shop music, merch, and products from independent creators.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Store | Porterful',
    description: 'Shop music, merch, and products from independent creators.',
  },
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
