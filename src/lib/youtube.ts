export type YouTubeVideoMetadata = {
  videoId: string
  canonicalUrl: string
  embedUrl: string
  title: string
  thumbnailUrl: string
  channelName: string | null
  publishedAt: string | null
}

type ParsedYouTubeUrl = {
  videoId: string
  canonicalUrl: string
  embedUrl: string
}

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
])

function withProtocol(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function cleanVideoId(value: string | null | undefined) {
  const videoId = (value || '').trim()
  if (!videoId) return ''
  return videoId.replace(/[^a-zA-Z0-9_-]/g, '')
}

export function parseYouTubeUrl(input: string): ParsedYouTubeUrl | null {
  if (typeof input !== 'string' || !input.trim()) return null

  let url: URL
  try {
    url = new URL(withProtocol(input))
  } catch {
    return null
  }

  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) {
    return null
  }

  let videoId = ''

  if (url.hostname.includes('youtu.be')) {
    videoId = cleanVideoId(url.pathname.split('/').filter(Boolean)[0])
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = cleanVideoId(url.pathname.split('/')[2])
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = cleanVideoId(url.pathname.split('/')[2])
  } else {
    videoId = cleanVideoId(url.searchParams.get('v'))
  }

  if (!videoId) {
    return null
  }

  return {
    videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
  }
}

async function fetchOEmbedMetadata(canonicalUrl: string) {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`YouTube metadata lookup failed with status ${response.status}`)
  }

  return response.json() as Promise<{
    title?: string
    thumbnail_url?: string
    author_name?: string
    author_url?: string
  }>
}

async function fetchYouTubeApiMetadata(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos')
  endpoint.searchParams.set('part', 'snippet')
  endpoint.searchParams.set('id', videoId)
  endpoint.searchParams.set('key', apiKey)

  const response = await fetch(endpoint.toString(), {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json().catch(() => null)
  const snippet = data?.items?.[0]?.snippet
  if (!snippet) return null

  return {
    title: typeof snippet.title === 'string' ? snippet.title : null,
    thumbnailUrl:
      snippet.thumbnails?.maxres?.url ||
      snippet.thumbnails?.standard?.url ||
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      null,
    channelName: typeof snippet.channelTitle === 'string' ? snippet.channelTitle : null,
    publishedAt: typeof snippet.publishedAt === 'string' ? snippet.publishedAt : null,
  }
}

export async function resolveYouTubeVideoMetadata(input: string): Promise<YouTubeVideoMetadata> {
  const parsed = parseYouTubeUrl(input)
  if (!parsed) {
    throw new Error('Only YouTube URLs are allowed.')
  }

  const [oEmbed, apiMetadata] = await Promise.all([
    fetchOEmbedMetadata(parsed.canonicalUrl).catch(() => null),
    fetchYouTubeApiMetadata(parsed.videoId).catch(() => null),
  ])

  const title = apiMetadata?.title || oEmbed?.title || 'Untitled video'
  const thumbnailUrl =
    apiMetadata?.thumbnailUrl ||
    oEmbed?.thumbnail_url ||
    `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`

  if (!thumbnailUrl) {
    throw new Error('Could not resolve a thumbnail for this YouTube video.')
  }

  return {
    videoId: parsed.videoId,
    canonicalUrl: parsed.canonicalUrl,
    embedUrl: parsed.embedUrl,
    title,
    thumbnailUrl,
    channelName: apiMetadata?.channelName || oEmbed?.author_name || null,
    publishedAt: apiMetadata?.publishedAt || null,
  }
}
