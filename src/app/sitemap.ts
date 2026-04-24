import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://porterful.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Static pages
  const staticPages = [
    '',
    '/competition',
    '/digital',
    '/marketplace',
    '/shop',
    '/store',
    '/tap',
    '/radio',
    '/playlists',
    '/trending',
    '/superfan',
    '/artist/od-porter',
    '/about',
    '/contact',
    '/faq',
    '/support',
    '/signal',
    '/register',
    '/signup',
    '/signup/superfan',
    '/login',
    '/dashboard',
    '/dashboard/access',
    '/dashboard/catalog',
    '/dashboard/artist',
    '/dashboard/upload',
    '/products',
    '/terms',
    '/privacy',
    '/press-kit',
    '/onboarding',
    '/challenge',
    '/resources',
    '/unlock',
    '/verify',
    '/wallet',
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
    if (page === '/competition') return 0.95  // High priority - active campaign
    if (page.startsWith('/album')) return 0.7
    if (page === '/digital' || page === '/marketplace' || page === '/store' || page === '/products') return 0.9
    return 0.8
  }
  
  return allPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: getPriority(page),
  }))
}
