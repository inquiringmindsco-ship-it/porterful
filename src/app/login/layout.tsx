import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Sign In to Porterful',
  description: 'Sign in to your Porterful account to access your music, merch, and artist dashboard.',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}