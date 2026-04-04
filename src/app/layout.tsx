import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Porterful',
  description: 'Music. Land. Mind. Law. Commerce. Credit.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ background: '#0a0a0a' }}>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=2" />
      </head>
      <body style={{ margin: 0, padding: 0, background: 'var(--pf-bg)', overflow: 'visible' }}>
        {children}
      </body>
    </html>
  )
}
