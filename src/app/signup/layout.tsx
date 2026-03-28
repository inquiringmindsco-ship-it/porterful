import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Signup - Join Porterful',
  description: 'Join Porterful as an artist or fan. Start selling music and merchandise or discover independent artists.',
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}