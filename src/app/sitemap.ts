import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://porterful.com'
  const currentDate = new Date().toISOString().split('T')[0]
  
  // Static pages
  const staticPages = [
    '',
    '/store',
    '/tap',
    '/radio',
    '/playlists',
    '/trending',
    '/superfan',
    '/artists',
    '/artist/od-porter',
    '/brands',
    '/collections/coming-home',
    '/music',
    '/about',
    '/contact',
    '/faq',
    '/support',
    '/signal',
    '/apply',
    '/signup',
    '/signup/superfan',
    '/terms',
    '/privacy',
    '/refund',
    '/dmca',
    '/moral-policy',
    '/press-kit',
    '/onboarding',
    '/challenge',
    '/resources',
    '/blog',
    '/ecosystem',
    '/systems',
    '/kids-chains',
    '/proud-to-pay',
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
    if (page.startsWith('/album')) return 0.7
    if (page === '/store' || page === '/artists' || page === '/music') return 0.9
    return 0.8
  }
  
  return allPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: getPriority(page),
  }))
}
