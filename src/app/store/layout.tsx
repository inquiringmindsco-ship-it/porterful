import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'O D Porter Store | Porterful',
  description: 'Shop music, vinyl, and merch from O D Porter. St. Louis hip-hop artist. Support independent art directly.',
  openGraph: {
    title: 'O D Porter Store | Porterful',
    description: 'Official store for O D Porter. Buy music, vinyl, and merch.',
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
