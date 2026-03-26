import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Artists | Porterful',
  description: 'Discover independent artists on Porterful. Support directly, 80% goes to the creator. No middlemen, no exploitation.',
  openGraph: {
    title: 'Browse Artists | Porterful',
    description: 'Discover independent artists and support them directly.',
    url: '/artists',
  },
}

export default function ArtistsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
