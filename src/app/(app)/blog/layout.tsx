import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Porterful | Building the Artist Economy',
  description: 'Updates, insights, and stories from the team building a platform where artists own everything. Learn about the artist economy, superfan revenue, and more.',
  alternates: { canonical: '/blog' },
  keywords: [
    'artist economy blog',
    'independent music industry',
    'artist retirement plan',
    'music platform news',
    'superfan economy',
    'direct to fan marketing',
    'artist revenue share',
    'music business insights'
  ],
  openGraph: {
    title: 'Blog - Porterful',
    description: 'Updates, insights, and stories from the team building a platform where artists own everything.',
    images: ['/og-blog.png'],
    type: 'website',
  },
}

export default function BlogPage() {
  return null // Client component handles rendering
}
