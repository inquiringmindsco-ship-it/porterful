import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sales Challenge | Porterful',
  description: 'Track verified sales progress, build momentum, and qualify for Porterful recognition through active challenge rules.',
  alternates: { canonical: '/challenge' },
  openGraph: {
    title: 'Sales Challenge | Porterful',
    description: 'Track verified sales progress, build momentum, and qualify for Porterful recognition through active challenge rules.',
    url: '/challenge',
  },
}

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
