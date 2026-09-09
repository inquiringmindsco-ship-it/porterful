import type { Metadata } from 'next'
import TermsContent from './terms/page'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms governing use of Porterful.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return <TermsContent />
}
