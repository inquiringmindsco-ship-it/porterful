import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Store | Porterful',
  description: 'Shop music, merch, and products from independent creators. Live products available now. Preview products coming soon.',
  openGraph: {
    title: 'Store | Porterful',
    description: 'Shop music, merch, and products from independent creators.',
    images: ['/og-image.png'],
  },
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
