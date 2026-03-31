// Artist Services - Data structures and sample data
// For the "Artist Services" / "Hunger Swipes" / "Skills" feature

export interface ArtistService {
  id: string;
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  title: string; // e.g., "Custom Jingle", "Voiceover"
  description: string;
  price: number; // base price
  priceType: 'fixed' | 'hourly' | 'starting_at';
  deliveryDays: number;
  category: 'music_production' | 'voiceover' | 'jingle' | 'custom_song' | 'other';
  portfolioLinks?: string[];
  inStock: boolean;
  orders: number;
  rating: number;
  tags?: string[];
}

export const SERVICE_CATEGORIES = [
  { value: 'music_production', label: 'Music Production', icon: '🎵' },
  { value: 'voiceover', label: 'Voiceover', icon: '🎙️' },
  { value: 'jingle', label: 'Jingles', icon: '🔔' },
  { value: 'custom_song', label: 'Custom Songs', icon: '🎶' },
  { value: 'other', label: 'Other Services', icon: '✨' },
] as const;

// Sample artist services
export const ARTIST_SERVICES: ArtistService[] = [
  {
    id: 'svc-001',
    artistId: 'od-porter',
    artistName: 'O D Porter',
    artistAvatar: 'OD',
    title: 'Custom Jingle',
    description: 'I\'ll create a catchy, memorable jingle for your brand, business, or project. Perfect for ads, intros, and promotions. 2 revisions included.',
    price: 250,
    priceType: 'fixed',
    deliveryDays: 5,
    category: 'jingle',
    portfolioLinks: ['https://soundcloud.com/odporter'],
    inStock: true,
    orders: 12,
    rating: 4.9,
    tags: ['branding', 'commercial', 'energetic'],
  },
  {
    id: 'svc-002',
    artistId: 'od-porter',
    artistName: 'O D Porter',
    artistAvatar: 'OD',
    title: 'Voiceover - Urban/Authentic',
    description: 'Authentic urban voiceover for commercials, podcasts, video games, and animations. Deep, commanding presence that commands attention.',
    price: 150,
    priceType: 'fixed',
    deliveryDays: 3,
    category: 'voiceover',
    portfolioLinks: ['https://youtube.com/@odporter'],
    inStock: true,
    orders: 28,
    rating: 5.0,
    tags: ['commercial', 'podcast', 'character'],
  },
  {
    id: 'svc-003',
    artistId: 'nikee-turbo',
    artistName: 'Nikee Turbo',
    artistAvatar: 'NT',
    title: 'Background Music - Videos/Podcasts',
    description: 'High-energy or chill background tracks for YouTube, TikTok, podcasts, and social media. Royalty-free for your content.',
    price: 100,
    priceType: 'starting_at',
    deliveryDays: 7,
    category: 'music_production',
    inStock: true,
    orders: 45,
    rating: 4.8,
    tags: ['youtube', 'tiktok', 'podcast', 'beats'],
  },
  {
    id: 'svc-004',
    artistId: 'local-producer-001',
    artistName: 'DJ Smooth',
    artistAvatar: 'DS',
    title: 'Full Music Production',
    description: 'Complete beat production with mixing. I deliver broadcast-ready tracks for albums, singles, or commercial use. Fast turnaround.',
    price: 500,
    priceType: 'fixed',
    deliveryDays: 14,
    category: 'music_production',
    portfolioLinks: ['https://beatstars.com/djsmooth'],
    inStock: true,
    orders: 67,
    rating: 4.7,
    tags: ['beats', 'mixing', 'mastering', 'studio'],
  },
  {
    id: 'svc-005',
    artistId: 'od-porter',
    artistName: 'O D Porter',
    artistAvatar: 'OD',
    title: 'Custom Theme Song',
    description: 'Signature theme song for your brand, YouTube channel, podcast, or personal brand. Includes full rights transfer.',
    price: 750,
    priceType: 'fixed',
    deliveryDays: 10,
    category: 'custom_song',
    inStock: true,
    orders: 8,
    rating: 5.0,
    tags: ['branding', 'youtube', 'podcast', 'signature'],
  },
  {
    id: 'svc-006',
    artistId: 'rising-star-001',
    artistName: 'Maya Keys',
    artistAvatar: 'MK',
    title: 'Ad Music / Commercial',
    description: 'Catchy, high-energy commercial music that sells. Perfect for radio, TV, and digital ads. Brands that move.',
    price: 350,
    priceType: 'starting_at',
    deliveryDays: 7,
    category: 'music_production',
    inStock: false,
    orders: 19,
    rating: 4.6,
    tags: ['advertising', 'commercial', 'energetic'],
  },
];

// Helper to format price display
export function formatServicePrice(service: ArtistService): string {
  switch (service.priceType) {
    case 'fixed':
      return `$${service.price}`;
    case 'hourly':
      return `$${service.price}/hr`;
    case 'starting_at':
      return `From $${service.price}`;
  }
}

// Helper to get category info
export function getCategoryInfo(category: ArtistService['category']) {
  return SERVICE_CATEGORIES.find(c => c.value === category) || SERVICE_CATEGORIES[4];
}
