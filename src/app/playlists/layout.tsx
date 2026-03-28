import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playlists - Curated Music Collections',
  description: 'Explore curated playlists on Porterful. Discover new music, support independent artists, find your next favorite track.',
  keywords: ['playlists', 'curated music', 'music collections', 'discover music', 'independent playlists'],
  openGraph: {
    title: 'Playlists - Porterful',
    description: 'Explore curated music collections.',
    images: ['/og-image.png'],
  },
}

export default function PlaylistsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}