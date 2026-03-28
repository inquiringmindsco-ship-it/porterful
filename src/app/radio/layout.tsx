import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Radio - Curated Artist Radio',
  description: 'Listen to curated artist radio on Porterful. Discover new independent artists and support the creator economy.',
  keywords: ['artist radio', 'curated radio', 'discover music', 'independent radio', 'music streaming'],
  openGraph: {
    title: 'Radio - Porterful',
    description: 'Curated artist radio for discovery.',
    images: ['/og-image.png'],
  },
}

export default function RadioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}