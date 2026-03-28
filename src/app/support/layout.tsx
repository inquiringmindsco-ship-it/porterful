import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support - Help Center',
  description: 'Get help with Porterful. Support for artists and fans.',
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}