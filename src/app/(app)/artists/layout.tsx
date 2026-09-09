import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artists | Porterful',
  description: 'Discover independent artists on Porterful. Support creators directly through our music + commerce platform.',
  alternates: { canonical: '/artists' },
  openGraph: {
    title: 'Artists | Porterful',
    description: 'Discover independent artists on Porterful. Support creators directly.',
  },
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
