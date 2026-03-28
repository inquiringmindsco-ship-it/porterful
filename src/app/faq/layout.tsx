import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Frequently asked questions about Porterful. Learn about selling music, merch, payments, and more.',
}

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}