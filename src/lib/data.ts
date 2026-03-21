// Real placeholder products for the marketplace
export const PRODUCTS = [
  // Artist Merch
  {
    id: 'ambiguous-tee',
    name: 'Ambiguous Tour Tee',
    artist: 'O D Porter',
    price: 28,
    category: 'merch',
    type: 'Apparel',
    description: 'Premium cotton tee from the Ambiguous tour. Soft, breathable, built to last.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    colors: ['Black', 'White', 'Orange'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    artistCut: 22.40, // 80%
    sales: 142,
    rating: 4.8,
    reviews: 89
  },
  {
    id: 'ambiguous-hoodie',
    name: 'Ambiguous Hoodie',
    artist: 'O D Porter',
    price: 65,
    category: 'merch',
    type: 'Apparel',
    description: 'Heavyweight hoodie with embroidered logo. Perfect for late nights in the studio.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    colors: ['Black', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    artistCut: 52, // 80%
    sales: 78,
    rating: 4.9,
    reviews: 45
  },
  {
    id: 'ambiguous-vinyl',
    name: 'Ambiguous EP (Vinyl)',
    artist: 'O D Porter',
    price: 35,
    category: 'music',
    type: 'Vinyl',
    description: 'Limited edition vinyl pressing. 180g audiophile quality with printed inner sleeve.',
    image: 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500',
    format: '12" Vinyl',
    tracks: 5,
    inStock: true,
    artistCut: 28, // 80%
    sales: 234,
    rating: 5.0,
    reviews: 67
  },
  {
    id: 'ambiguous-cassette',
    name: 'Ambiguous Cassette',
    artist: 'O D Porter',
    price: 12,
    category: 'music',
    type: 'Cassette',
    description: 'Hand-numbered cassette tape. Orange shell with black ink. Limited to 500.',
    image: 'https://images.unsplash.com/photo-1618631824070-8a6c03e2e3ed?w=500',
    format: 'Cassette',
    tracks: 5,
    inStock: true,
    artistCut: 9.60, // 80%
    sales: 189,
    rating: 4.7,
    reviews: 34,
    limited: true,
    limitedCount: 500
  },
  // Marketplace Items (20% to artists)
  {
    id: 'premium-headphones',
    name: 'Premium Wireless Headphones',
    brand: 'SoundMax',
    price: 89,
    category: 'electronics',
    type: 'Electronics',
    description: 'Studio-quality wireless headphones with 40-hour battery. Active noise cancellation.',
    image: 'https://images.unsplash.com/photo-1505740420922-5e284d373aa6?w=500',
    features: ['40hr battery', 'ANC', 'Bluetooth 5.2'],
    inStock: true,
    artistCut: 17.80, // 20%
    sales: 567,
    rating: 4.6,
    reviews: 234
  },
  {
    id: 'portable-speaker',
    name: 'Portable Bluetooth Speaker',
    brand: 'BassPro',
    price: 49,
    category: 'electronics',
    type: 'Electronics',
    description: 'Waterproof portable speaker with 360° sound. Perfect for outdoor sessions.',
    image: 'https://images.unsplash.com/photo-1608043152269-56e1b2a1e354?w=500',
    features: ['Waterproof', '12hr battery', '360° sound'],
    inStock: true,
    artistCut: 9.80, // 20%
    sales: 892,
    rating: 4.5,
    reviews: 189
  },
  {
    id: 'eco-toothbrush',
    name: 'Bamboo Toothbrush Set',
    brand: 'EcoBrush',
    price: 12,
    category: 'essentials',
    type: 'Personal Care',
    description: 'Sustainable bamboo toothbrushes. Biodegradable, vegan, and dentist-approved.',
    image: 'https://images.unsplash.com/photo-1607613009820-a7a7e4e0b3b0?w=500',
    features: ['Biodegradable', 'Charcoal bristles', '4-pack'],
    inStock: true,
    artistCut: 2.40, // 20%
    sales: 1243,
    rating: 4.4,
    reviews: 456
  },
  {
    id: 'organic-shampoo',
    name: 'Organic Shampoo Bar',
    brand: 'Naturals Co',
    price: 14,
    category: 'essentials',
    type: 'Personal Care',
    description: 'Zero-waste shampoo bar. No plastic, all natural, works for all hair types.',
    image: 'https://images.unsplash.com/photo-1608248598036-0a3a22c4f7ce?w=500',
    features: ['Zero waste', '60+ washes', 'All hair types'],
    inStock: true,
    artistCut: 2.80, // 20%
    sales: 678,
    rating: 4.7,
    reviews: 198
  }
];

// Featured artists
export const ARTISTS = [
  {
    id: 'od-porter',
    name: 'O D Porter',
    genre: 'Hip-Hop / R&B',
    location: 'St. Louis, MO',
    bio: 'St. Louis artist blending hip-hop, R&B, and soul. Born in Miami, raised in New Orleans & St. Louis. Creating music that speaks to the human experience.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb1614b109?w=500',
    verified: true,
    supporters: 2847,
    earnings: 8947,
    tracks: 21,
    products: 4
  }
];

// Featured tracks - only songs WITH cover art
export const TRACKS = [
  {
    id: 'oddysee',
    title: 'Oddysee',
    artist: 'O D Porter',
    album: 'Ambiguous EP',
    duration: 222, // 3:42 in seconds
    price: 1,
    plays: 125000,
    image: '/covers/cover-art.png',
    audio_url: '/audio/oddysee.mp3'
  },
  {
    id: 'too-stingy',
    title: 'Too Stingy',
    artist: 'O D Porter',
    album: 'Too Stingy (Single)',
    duration: 195, // 3:15
    price: 1,
    plays: 89000,
    image: '/covers/too-stingy-cover.png',
    audio_url: '/audio/too-stingy.mp3'
  },
  {
    id: 'god-is-good',
    title: 'God Is Good',
    artist: 'O D Porter',
    album: 'God Is Good',
    duration: 261, // 4:21
    price: 1,
    plays: 67000,
    image: '/covers/god-is-good-cover.png',
    audio_url: '/audio/god-is-good.mp3'
  },
  {
    id: 'the-pains',
    title: 'The Pains',
    artist: 'O D Porter',
    album: 'God Is Good', // Same album as God Is Good
    duration: 225, // 3:45
    price: 1,
    plays: 45000,
    image: '/covers/god-is-good-cover.png', // Same cover
    audio_url: '/audio/the-pains.mp3'
  },
  {
    id: 'tlf',
    title: 'TLF',
    artist: 'O D Porter',
    album: 'TLF (Single)',
    duration: 208, // 3:28
    price: 1,
    plays: 32000,
    image: '/covers/tlf-cover.png',
    audio_url: '/audio/tlf.mp3'
  }
];

// Hidden tracks (no art yet)
export const HIDDEN_TRACKS = [
  { id: 'movement', title: 'Movement', artist: 'O D Porter', album: 'Ambiguous EP' },
  { id: 'vibes', title: 'Vibes', artist: 'O D Porter', album: 'Ambiguous EP' },
  { id: 'ambiguous', title: 'Ambiguous', artist: 'O D Porter', album: 'Ambiguous EP' },
];