// CDN base URL for audio files
const CDN_BASE = 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/audio/albums';

// Helper to get CDN URL for a track
function audio(album: string, filename: string): string {
  return `${CDN_BASE}/${album}/${encodeURIComponent(filename)}`;
}

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
    artistCut: 22.40,
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
    description: 'Heavyweight hoodie with embroidered logo.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    colors: ['Black', 'Gray'],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    artistCut: 52,
    sales: 78,
    rating: 4.9,
    reviews: 45
  },
  {
    id: 'ambiguous-vinyl',
    name: 'Ambiguous Vinyl',
    artist: 'O D Porter',
    price: 35,
    category: 'music',
    type: 'Vinyl',
    description: 'Limited edition vinyl. 180g audiophile quality.',
    image: 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500',
    format: '12" Vinyl',
    tracks: 21,
    inStock: true,
    artistCut: 28,
    sales: 234,
    rating: 5.0,
    reviews: 67
  }
];

// Featured artists
export const ARTISTS = [
  {
    id: 'od-porter',
    name: 'O D Porter',
    genre: 'Hip-Hop / R&B',
    location: 'St. Louis, MO',
    bio: 'St. Louis artist blending hip-hop, R&B, and soul. Born in Miami, raised in New Orleans & St. Louis.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb1614b109?w=500',
    verified: true,
    supporters: 2847,
    earnings: 8947,
    tracks: 58,
    products: 3
  }
];

// ALL TRACKS - With CDN Audio URLs
export const TRACKS = [
  // AMBIGUOUS ALBUM (21 tracks) - ✅ CDN
  { id: 'amb-01', title: 'Oddysee', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 125000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '01 Oddysee.mp3') },
  { id: 'amb-02', title: 'Zarah', artist: 'O D Porter', album: 'Ambiguous', duration: '3:34', price: 1, plays: 89000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '02 Zarah.mp3') },
  { id: 'amb-03', title: 'Dopamines', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 67000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '03 Dopamines.mp3') },
  { id: 'amb-04', title: 'I Like All', artist: 'O D Porter', album: 'Ambiguous', duration: '4:04', price: 1, plays: 45000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '04 I Like All.mp3') },
  { id: 'amb-05', title: 'Danielles Dance', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 72000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '05 Danielles Dance.mp3') },
  { id: 'amb-06', title: 'Make A Move', artist: 'O D Porter', album: 'Ambiguous', duration: '3:51', price: 1, plays: 152000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '06 Make A Move.mp3') },
  { id: 'amb-07', title: 'Pack Down', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 39000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '07 Pack Down.mp3') },
  { id: 'amb-08', title: 'Lust For Love', artist: 'O D Porter', album: 'Ambiguous', duration: '4:41', price: 1, plays: 35000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '08 Lust For Love.mp3') },
  { id: 'amb-09', title: 'Oxymoron (Interlude)', artist: 'O D Porter', album: 'Ambiguous', duration: '2:42', price: 1, plays: 35000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '09 Oxymoron (interlude).mp3') },
  { id: 'amb-10', title: 'Briauns House', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 48000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '10 Briauns House.mp3') },
  { id: 'amb-11', title: 'Torys Total Trip', artist: 'O D Porter', album: 'Ambiguous', duration: '4:30', price: 1, plays: 39000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '11 Torys Total Trip.mp3') },
  { id: 'amb-12', title: 'LeCole', artist: 'O D Porter', album: 'Ambiguous', duration: '4:36', price: 1, plays: 35000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '12 LeCole.mp3') },
  { id: 'amb-13', title: 'Cypher', artist: 'O D Porter', album: 'Ambiguous', duration: '4:22', price: 1, plays: 38000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '13 Cypher.mp3') },
  { id: 'amb-14', title: 'Bible', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 34000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '14 Bible.mp3') },
  { id: 'amb-15', title: 'Dirty World', artist: 'O D Porter', album: 'Ambiguous', duration: '3:01', price: 1, plays: 43000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '15 Dirty World.mp3') },
  { id: 'amb-16', title: 'The Employee', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 36000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '16 The Employee.mp3') },
  { id: 'amb-17', title: 'Veni Vidi Vici', artist: 'O D Porter', album: 'Ambiguous', duration: '2:30', price: 1, plays: 40000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '17 Veni Vidi Vici.mp3') },
  { id: 'amb-18', title: 'Pack Down (Remix)', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 27000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '18 Pack Down (Remix).mp3') },
  { id: 'amb-19', title: 'Lil Playa', artist: 'O D Porter', album: 'Ambiguous', duration: '2:57', price: 1, plays: 60000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '19 Lil Playa.mp3') },
  { id: 'amb-20', title: 'Nostalgism', artist: 'O D Porter', album: 'Ambiguous', duration: '3:02', price: 1, plays: 31000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '20 Nostalgism.mp3') },
  { id: 'amb-21', title: 'Enlightened', artist: 'O D Porter', album: 'Ambiguous', duration: '3:40', price: 1, plays: 28000, image: '/album-art/Ambiguous.jpg', audio_url: audio('Ambiguous', '21 Enlightened.mp3') },

  // FROM FEAST TO FAMINE (15 tracks) - ✅ CDN
  { id: 'fff-01', title: 'Intro', artist: 'O D Porter', album: 'From Feast to Famine', duration: '1:23', price: 1, plays: 45000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '01_Intro.mp3') },
  { id: 'fff-02', title: 'Breathe', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:42', price: 1, plays: 89000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '02_Breathe.mp3') },
  { id: 'fff-03', title: 'Heal', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:15', price: 1, plays: 67000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '03_Heal.mp3') },
  { id: 'fff-04', title: 'Feel This Pain', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:58', price: 1, plays: 52000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '04_Feel_This_Pain.mp3') },
  { id: 'fff-05', title: 'Ride', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:21', price: 1, plays: 71000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '05_Ride.mp3') },

  // GOD IS GOOD (9 tracks) - ✅ CDN
  { id: 'gig-01', title: 'God is Good (Intro)', artist: 'O D Porter', album: 'God Is Good', duration: '2:30', price: 1, plays: 92000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '01_God_is_Good_(Intro).mp3') },
  { id: 'gig-02', title: 'DreamWorld', artist: 'O D Porter', album: 'God Is Good', duration: '3:45', price: 1, plays: 78000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '03_DreamWorld.mp3') },
  { id: 'gig-03', title: 'The Pain', artist: 'O D Porter', album: 'God Is Good', duration: '4:02', price: 1, plays: 65000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '06_The_Pain.mp3') },

  // ONE DAY (19 tracks) - ✅ CDN
  { id: 'od-01', title: 'The Intro', artist: 'O D Porter', album: 'One Day', duration: '1:45', price: 1, plays: 54000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '01_The_Intro.mp3') },
  { id: 'od-02', title: "Push'N", artist: 'O D Porter', album: 'One Day', duration: '3:12', price: 1, plays: 67000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', "02_Push'N.mp3") },
  { id: 'od-03', title: 'Real Definition', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 89000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '03_Real_Definition.mp3') },
  { id: 'od-04', title: 'BandFlow', artist: 'O D Porter', album: 'One Day', duration: '3:33', price: 1, plays: 45000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '04_BandFlow.mp3') },
  { id: 'od-05', title: 'MFCCH', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 38000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '05_MFCCH.mp3') },

  // STREETS THOUGHT I LEFT (9 tracks) - ✅ CDN
  { id: 'stl-01', title: 'Aint Gone Let Up', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:15', price: 1, plays: 125000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Aint_Gone_Let_Up.mp3') },
  { id: 'stl-02', title: 'Aired Em Out', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '2:45', price: 1, plays: 98000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Aired_Em_Out.mp3') },
  { id: 'stl-03', title: 'Forever Young', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:58', price: 1, plays: 76000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Forever_Young.mp3') },
  { id: 'stl-04', title: 'Intro To My World', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '2:22', price: 1, plays: 89000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-__Intro_To_My_World.mp3') },
  { id: 'stl-05', title: 'Sometime', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:45', price: 1, plays: 54000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Sometime.mp3') },

  // ROXANNITY (16 tracks) - placeholder
  { id: 'rox-01', title: 'Roxannity (Intro)', artist: 'O D Porter', album: 'Roxannity', duration: '3:23', price: 1, plays: 54000, image: '/album-art/Roxannity.jpg' },
  { id: 'rox-02', title: 'Decomposure', artist: 'O D Porter', album: 'Roxannity', duration: '2:17', price: 1, plays: 42000, image: '/album-art/Roxannity.jpg' },
  { id: 'rox-03', title: 'Freak Like Me', artist: 'O D Porter', album: 'Roxannity', duration: '3:40', price: 1, plays: 78000, image: '/album-art/Roxannity.jpg' },
  { id: 'rox-04', title: 'Spoken Wordz', artist: 'O D Porter', album: 'Roxannity', duration: '3:56', price: 1, plays: 51000, image: '/album-art/Roxannity.jpg' },
  { id: 'rox-05', title: 'Heart & Soul', artist: 'O D Porter', album: 'Roxannity', duration: '2:31', price: 1, plays: 65000, image: '/album-art/Roxannity.jpg' },

  // ARTGASM (2 tracks) - placeholder
  { id: 'art-01', title: 'Artgasm (Intro)', artist: 'O D Porter', album: 'Artgasm', duration: '2:15', price: 1, plays: 34000, image: '/album-art/Artgasm.jpg' },
  { id: 'art-02', title: 'Satisfaction', artist: 'O D Porter', album: 'Artgasm', duration: '3:45', price: 1, plays: 28000, image: '/album-art/Artgasm.jpg' },

  // LEVI (9 tracks) - placeholder
  { id: 'lev-01', title: 'Levi (Intro)', artist: 'O D Porter', album: 'Levi', duration: '1:58', price: 1, plays: 45000, image: '/album-art/Levi.jpg' },
  { id: 'lev-02', title: '82 FAM TTD', artist: 'O D Porter', album: 'Levi', duration: '3:22', price: 1, plays: 67000, image: '/album-art/Levi.jpg' },
  { id: 'lev-03', title: 'Grind Mode', artist: 'O D Porter', album: 'Levi', duration: '2:58', price: 1, plays: 52000, image: '/album-art/Levi.jpg' },

  // SINGLES
  { id: 'sg-01', title: 'Amen', artist: 'O D Porter', album: 'Singles', duration: '3:42', price: 1, plays: 125000, image: '/album-art/GodIsGood.jpg' },
  { id: 'sg-02', title: "C'est La Vie", artist: 'O D Porter', album: 'Singles', duration: '4:15', price: 1, plays: 89000, image: '/album-art/GodIsGood.jpg' },
  { id: 'sg-03', title: 'Breathe', artist: 'O D Porter', album: 'Singles', duration: '3:30', price: 1, plays: 156000, image: '/album-art/FromFeastToFamine.jpg' },
];

// Album data for grouping
export const ALBUMS = {
  ambiguous: { id: 'ambiguous', name: 'Ambiguous', artist: 'O D Porter', year: 2024, image: '/album-art/Ambiguous.jpg', tracks: 21 },
  fromFeastToFamine: { id: 'from-feast-to-famine', name: 'From Feast to Famine', artist: 'O D Porter', year: 2023, image: '/album-art/FromFeastToFamine.jpg', tracks: 15 },
  godIsGood: { id: 'god-is-good', name: 'God Is Good', artist: 'O D Porter', year: 2023, image: '/album-art/GodIsGood.jpg', tracks: 9 },
  oneDay: { id: 'one-day', name: 'One Day', artist: 'O D Porter', year: 2024, image: '/album-art/OneDay.jpg', tracks: 19 },
  streetsThoughtILeft: { id: 'streets-thought-i-left', name: 'Streets Thought I Left', artist: 'Jai Jai', year: 2023, image: '/album-art/StreetsThoughtILeft.jpg', tracks: 9 },
  roxannity: { id: 'roxannity', name: 'Roxannity', artist: 'O D Porter', year: 2024, image: '/album-art/Roxannity.jpg', tracks: 16 },
  artgasm: { id: 'artgasm', name: 'Artgasm', artist: 'O D Porter', year: 2024, image: '/album-art/Artgasm.jpg', tracks: 2 },
  levi: { id: 'levi', name: 'Levi', artist: 'O D Porter', year: 2024, image: '/album-art/Levi.jpg', tracks: 9 },
};

export { TRACKS };