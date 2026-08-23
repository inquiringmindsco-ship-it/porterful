import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://porterful.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Static pages (canonical URLs only — /competition → /apply, /store → /marketplace)
  const staticPages = [
    '',
    '/apply',
    '/digital',
    '/marketplace',
    '/shop',
    '/radio',
    '/playlists',
    '/trending',
    '/superfan',
    '/signup',
    '/signup/superfan',
    '/login',
    '/artist/od-porter',
    '/dashboard',
    '/dashboard/artist',
    '/dashboard/upload',
    '/terms',
    '/privacy',
    '/refund',
    '/dmca',
    '/press-kit',
    '/onboarding',
    '/resources',
    '/verify',
    '/wallet',
    '/blog',
  ]
  
  // Albums from data
  const albums = [
    'ambiguous',
    'from-feast-to-famine',
    'god-is-good',
    'one-day',
    'streets-thought-i-left',
    'roxannity',
    'artgasm',
    'levi',
  ]
  
  const albumPages = albums.map(album => `/album/${album}`)
  
  // All pages
  const allPages = [...staticPages, ...albumPages]
  
  const getPriority = (page: string): number => {
    if (page === '') return 1.0
    if (page === '/apply') return 0.95
    if (page === '/blog') return 0.7
    if (page.startsWith('/album')) return 0.7
    if (page === '/digital' || page === '/marketplace' || page === '/shop') return 0.9
    if (page.startsWith('/dashboard')) return 0.5
    return 0.8
  }

  const getChangeFrequency = (page: string): MetadataRoute.Sitemap[0]['changeFrequency'] => {
    if (page === '' || page === '/apply') return 'daily'
    if (page.startsWith('/album') || page === '/blog') return 'weekly'
    if (page.startsWith('/dashboard')) return 'monthly'
    if (page === '/terms' || page === '/privacy') return 'monthly'
    if (page === '/shop') return 'daily'
    return 'weekly'
  }
  
  return allPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: getChangeFrequency(page),
    priority: getPriority(page),
  }))
}
