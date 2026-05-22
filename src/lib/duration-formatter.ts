// Canonical duration formatter - handles all duration input types
export function formatDuration(duration: string | number | undefined | null): string {
  // Already formatted like "3:36"
  if (typeof duration === 'string' && duration.includes(':')) {
    return duration
  }
  
  // Numeric seconds (216)
  if (typeof duration === 'number' || (typeof duration === 'string' && /^\d+(\.\d+)?$/.test(duration))) {
    const seconds = typeof duration === 'number' ? duration : Number(duration)
    if (isNaN(seconds)) return '--:--'
    if (seconds <= 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Fallback for invalid/null
  return duration?.toString() || '--:--'
}

// Canonical album aliases - normalize variant names to official
const ALBUM_ALIASES: Record<string, string> = {
  // Roxanity variants
  'Roxannity': 'Roxanity',
  'Roxanity': 'Roxanity',
  
  // God Is Good variants
  'God Is Good': 'God Is Good',
  'GodIsGood': 'God Is Good',
  "God's Good": 'God Is Good',
  
  // One Day variants
  'One Day': 'One Day',
  'OneDay': 'One Day',
  
  // From Feast to Famine variants
  'From Feast to Famine': 'From Feast to Famine',
  'FromFeastToFamine': 'From Feast to Famine',
  'From_Feast_to_Famine': 'From Feast to Famine',
  
  // Ambiguous variants
  'Ambiguous': 'Ambiguous',
  
  // Artgasm variants
  'Artgasm': 'Artgasm',
  
  // Levi variants
  'Levi': 'Levi',
  'Streets Thought I Left': 'Streets Thought I Left',
}

// Canonical track title aliases
const TITLE_ALIASES: Record<string, string> = {
  // Roxanity tracks
  'Roxannity (Intro)': 'Roxanne',
  'Roxanity (Intro)': 'Roxanne',
  'Pure Lust': 'GBK Good By Kisses',
  'GBK Good By Kisses': 'GBK Good By Kisses',
  
  // God Is Good tracks  
  'DreamWorld': 'Dream World',
  'Dream World': 'Dream World',
  "Cest La Vie": "C'est La Vie",
  "C'est La Vie": "C'est La Vie",
  'TBT': 'Throwback Thursday',
  'Throwback Thursday': 'Throwback Thursday',
  'The Intro': 'Intro',
  'Intro': 'Intro',
  "Push'N": "Push'N",
  'PushN': "Push'N",
  
  // From Feast to Famine tracks
  'BandFlow': 'Band Flow',
  'Band Flow': 'Band Flow',

  // Audio/file suffix variants
  'Goddess to Me': 'Goddess to Me SD 480p',
  'Goddess to Me SD 480p': 'Goddess to Me SD 480p',
  'Facts of Life': '18 Facts Of Life',
  '18 Facts Of Life': '18 Facts Of Life',

  // One Day tracks
  'Back At It': 'Back At It SD 480p',
  'Back At It SD 480p': 'Back At It SD 480p',
  'GBK2': 'Good Bye Kisses 2',
  'Good Bye Kisses 2': 'Good Bye Kisses 2',
  'Mike Tyson': 'Mike Tyson (One Round)',
  'Mike Tyson (One Round)': 'Mike Tyson (One Round)',
  
  // Ambiguous tracks
  'Oxymoron (Interlude)': 'Oxymoron',
  'Oxymoron': 'Oxymoron',
  'We The Shh': 'We The Shh Now',
  'We The Shh Now': 'We The Shh Now',
  'Sometime': 'Sometimes',
  'Sometimes': 'Sometimes',
  "Tory's Total Trip": 'Torys Total Trip',
  'Torys Total Trip': 'Torys Total Trip',
}

// Normalize album name to canonical
export function canonicalAlbum(album: string | null | undefined): string | null {
  if (!album) return null
  const trimmed = album.trim()
  return ALBUM_ALIASES[trimmed] || trimmed
}

// Normalize track title to canonical  
export function canonicalTitle(title: string): string {
  return TITLE_ALIASES[title.trim()] || title.trim()
}

// Check if a track belongs to a real album (not Singles)
export function isRealAlbum(album: string | null | undefined): boolean {
  if (!album) return false
  const canonical = canonicalAlbum(album)
  const realAlbums = [
    'Ambiguous',
    'From Feast to Famine', 
    'God Is Good',
    'One Day',
    'Roxanity',
    'Artgasm',
    'Levi',
    'Streets Thought I Left',
  ]
  return canonical ? realAlbums.includes(canonical) : false
}
