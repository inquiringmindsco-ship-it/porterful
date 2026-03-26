import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace | Porterful',
  description: 'Browse merch, music, and exclusive drops from Porterful artists. Every purchase puts 80% directly in artists\' pockets.',
  openGraph: {
    title: 'Marketplace | Porterful',
    description: 'Browse merch, music, and exclusive drops from Porterful artists.',
    url: '/marketplace',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
