import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Music - Buy Albums & Singles',
  description: 'Buy digital music directly from independent artists. Albums, singles, EP — own your music. 80% goes to artists with no middleman.',
  keywords: ['buy music', 'digital music', 'album download', 'EP', 'single', 'independent music', 'support artists'],
  openGraph: {
    title: 'Digital Music - Porterful',
    description: 'Buy digital music directly from independent artists.',
    images: ['/og-image.png'],
  },
}

export default function DigitalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}