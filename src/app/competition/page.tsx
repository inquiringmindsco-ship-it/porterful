import { Metadata } from 'next'
import CompetitionClient from './CompetitionClient'

export const metadata: Metadata = {
  title: 'Artist Competition — $10K Challenge | Porterful',
  description:
    'Join the Porterful $10K Artist Competition. First artist to earn $10,000 wins a $10,000 bonus. Limited founding artist spots available.',
  keywords: ['artist competition', 'music competition', 'earn money', 'independent artist', 'Porterful'],
  openGraph: {
    title: 'Porterful $10K Artist Competition',
    description: 'First artist to earn $10,000 wins $10,000. Join the founding artist window.',
    url: 'https://porterful.com/competition',
    siteName: 'Porterful',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Porterful $10K Artist Competition',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Porterful $10K Artist Competition',
    description: 'First artist to earn $10,000 wins $10,000. Limited founding spots.',
  },
  alternates: {
    canonical: 'https://porterful.com/competition',
  },
}

export default function CompetitionPage() {
  return <CompetitionClient />
}
