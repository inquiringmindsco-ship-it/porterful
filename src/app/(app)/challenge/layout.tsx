import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '$10K Challenge | Porterful',
  description: 'First artist to earn $10K in sales on Porterful gets a $10K bonus. No cap, no tricks. Just real support for real artists.',
  openGraph: {
    title: '$10K Challenge | Porterful',
    description: 'First artist to earn $10K in sales gets a $10K bonus. artist-first payout, 20% matched by Porterful.',
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
