import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://porterful.com'
  const currentDate = new Date().toISOString()
  
  // Static pages
  const staticPages = [
    '',
    '/digital',
    '/marketplace',
    '/shop',
    '/radio',
    '/playlists',
    '/artist/od-porter',
    '/about',
    '/support',
    '/signup',
    '/login',
    '/dashboard/artist',
    '/dashboard/upload',
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
  
  return allPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: currentDate,
    changeFrequency: page === '' ? 'daily' : 'weekly',
    priority: page === '' ? 1.0 : page.startsWith('/album') ? 0.7 : page === '/digital' || page === '/marketplace' || page === '/store' ? 0.9 : 0.8,
  }))
}rity: page === '' ? 1 : page.startsWith('/album') ? 0.7 : 0.8,
  }))
}