import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact - Get in Touch',
  description: 'Contact the Porterful team. Questions about selling music, merch, or platform support.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}