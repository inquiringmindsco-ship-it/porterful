import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Artists - Discover Independent Artists',
  description: 'Discover independent artists on Porterful. Stream music, buy merch, support creators directly. No labels, no middlemen — 80% goes to artists.',
  keywords: ['independent artists', 'discover music', 'new artists', 'music artists', 'unsigned artists', 'indie artists'],
  openGraph: {
    title: 'Artists - Porterful',
    description: 'Discover and support independent artists directly.',
    images: ['/og-image.png'],
  },
}

export default function ArtistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}