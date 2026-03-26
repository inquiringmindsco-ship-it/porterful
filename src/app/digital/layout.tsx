import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Store | Porterful',
  description: 'Stream and buy music directly from independent artists. 80% of every sale goes straight to the creator.',
  openGraph: {
    title: 'Digital Store | Porterful',
    description: 'Stream and buy music directly from independent artists.',
    url: '/digital',
  },
}

export default function DigitalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
