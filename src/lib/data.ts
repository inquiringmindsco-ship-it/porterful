// CDN base URL for audio files (Supabase storage bucket)
const CDN = 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/audio';
const ARTISTS_CDN = 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/audio/artists';

// Audio URL helper - handles URL encoding
const audio = (album: string, file: string) => `${CDN}/albums/${album}/${encodeURIComponent(file)}`;
const artistAudio = (artist: string, file: string) => `${ARTISTS_CDN}/${artist}/${encodeURIComponent(file)}`;

// Album art paths - matching actual filenames in public/album-art/
const ALBUM_ART = {
  Ambiguous: '/album-art/Ambiguous.jpg',
  FromFeastToFamine: '/album-art/From_Feast_to_Famine.jpg',
  GodIsGood: '/album-art/God_Is_Good.jpg',
  OneDay: '/album-art/One_Day.jpg',
  StreetsThoughtILeft: '/album-art/Streets_Thought_I_Left.jpg',
  Roxannity: '/album-art/Roxannity.jpg',
  Artgasm: '/album-art/Artgasm.jpg',
  Levi: '/album-art/Levi.jpg',
  Singles: '/album-art/Singles.jpg',
};

// All tracks with CDN audio URLs
export const TRACKS = [
  // AMBIGUOUS - 21 tracks
  { id: 'amb-01', title: 'Oddysee', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 125000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '01 Oddysee.mp3') },
  { id: 'amb-02', title: 'Zarah', artist: 'O D Porter', album: 'Ambiguous', duration: '3:34', price: 1, plays: 89000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '02 Zarah.mp3') },
  { id: 'amb-03', title: 'Dopamines', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 67000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '03 Dopamines.mp3') },
  { id: 'amb-04', title: 'I Like All', artist: 'O D Porter', album: 'Ambiguous', duration: '4:04', price: 1, plays: 45000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '04 I Like All.mp3') },
  { id: 'amb-05', title: 'Danielles Dance', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 72000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '05 Danielles Dance.mp3') },
  { id: 'amb-06', title: 'Make A Move', artist: 'O D Porter', album: 'Ambiguous', duration: '3:51', price: 1, plays: 152000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '06 Make A Move.mp3') },
  { id: 'amb-07', title: 'Pack Down', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 39000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '07 Pack Down.mp3') },
  { id: 'amb-08', title: 'Lust For Love', artist: 'O D Porter', album: 'Ambiguous', duration: '4:41', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '08 Lust For Love.mp3') },
  { id: 'amb-09', title: 'Oxymoron (Interlude)', artist: 'O D Porter', album: 'Ambiguous', duration: '2:42', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '09 Oxymoron (interlude).mp3') },
  { id: 'amb-10', title: 'Briauns House', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 48000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '10 Briauns House.mp3') },
  { id: 'amb-11', title: 'Torys Total Trip', artist: 'O D Porter', album: 'Ambiguous', duration: '4:30', price: 1, plays: 39000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '11 Torys Total Trip.mp3') },
  { id: 'amb-12', title: 'LeCole', artist: 'O D Porter', album: 'Ambiguous', duration: '4:36', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '12 LeCole.mp3') },
  { id: 'amb-13', title: 'Cypher', artist: 'O D Porter', album: 'Ambiguous', duration: '4:22', price: 1, plays: 38000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '13 Cypher.mp3') },
  { id: 'amb-14', title: 'Bible', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 34000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '14 Bible.mp3') },
  { id: 'amb-15', title: 'Dirty World', artist: 'O D Porter', album: 'Ambiguous', duration: '3:01', price: 1, plays: 43000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '15 Dirty World.mp3') },
  { id: 'amb-16', title: 'The Employee', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 36000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '16 The Employee.mp3') },
  { id: 'amb-17', title: 'Veni Vidi Vici', artist: 'O D Porter', album: 'Ambiguous', duration: '2:30', price: 1, plays: 40000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '17 Veni Vidi Vici.mp3') },
  { id: 'amb-18', title: 'Pack Down (Remix)', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 27000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '18 Pack Down (Remix).mp3') },
  { id: 'amb-19', title: 'Lil Playa', artist: 'O D Porter', album: 'Ambiguous', duration: '2:57', price: 1, plays: 60000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '19 Lil Playa.mp3') },
  { id: 'amb-20', title: 'Nostalgism', artist: 'O D Porter', album: 'Ambiguous', duration: '3:02', price: 1, plays: 31000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '20 Nostalgism.mp3') },
  { id: 'amb-21', title: 'Enlightened', artist: 'O D Porter', album: 'Ambiguous', duration: '3:40', price: 1, plays: 28000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', '21 Enlightened.mp3') },

  // FROM FEAST TO FAMINE - 10 tracks
  { id: 'fff-01', title: 'Intro', artist: 'O D Porter', album: 'From Feast to Famine', duration: '1:23', price: 1, plays: 45000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '01 Intro.mp3') },
  { id: 'fff-02', title: 'Breathe', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:42', price: 1, plays: 89000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '02 Breathe.mp3') },
  { id: 'fff-03', title: 'Heal', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:15', price: 1, plays: 67000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '03 Heal.mp3') },
  { id: 'fff-04', title: 'Feel This Pain', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:58', price: 1, plays: 52000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '04 Feel This Pain.mp3') },
  { id: 'fff-05', title: 'Ride', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:21', price: 1, plays: 71000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '05 Ride.mp3') },
  { id: 'fff-06', title: 'IJKFBO', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:45', price: 1, plays: 58000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '06 IJKFBO.mp3') },
  { id: 'fff-07', title: 'Trust', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:12', price: 1, plays: 64000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '07 Trust.mp3') },
  { id: 'fff-08', title: 'Funeral', artist: 'O D Porter', album: 'From Feast to Famine', duration: '5:23', price: 1, plays: 42000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '08 Funeral.mp3') },
  { id: 'fff-09', title: 'Unchained Melodies', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:56', price: 1, plays: 83000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '09 Unchained Melodies.mp3') },
  { id: 'fff-10', title: 'Change Up (Outro)', artist: 'O D Porter', album: 'From Feast to Famine', duration: '2:18', price: 1, plays: 29000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '10 Change Up (Outro).mp3') },

  // GOD IS GOOD - 9 tracks
  { id: 'gig-01', title: 'God is Good (Intro)', artist: 'O D Porter', album: 'God Is Good', duration: '2:30', price: 1, plays: 92000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-02', title: 'DreamWorld', artist: 'O D Porter', album: 'God Is Good', duration: '3:45', price: 1, plays: 78000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-03', title: 'The Pain', artist: 'O D Porter', album: 'God Is Good', duration: '4:02', price: 1, plays: 65000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-04', title: 'Amen', artist: 'O D Porter', album: 'God Is Good', duration: '3:42', price: 1, plays: 125000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-05', title: "C'est La Vie", artist: 'O D Porter', album: 'God Is Good', duration: '4:15', price: 1, plays: 89000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-06', title: 'Miscommunication', artist: 'O D Porter', album: 'God Is Good', duration: '3:28', price: 1, plays: 56000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-07', title: 'TBT', artist: 'O D Porter', album: 'God Is Good', duration: '2:45', price: 1, plays: 71000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-08', title: 'The Untold Story', artist: 'O D Porter', album: 'God Is Good', duration: '4:32', price: 1, plays: 48000, image: ALBUM_ART.GodIsGood, audio_url: '' },
  { id: 'gig-09', title: 'When GOD Cry', artist: 'O D Porter', album: 'God Is Good', duration: '5:01', price: 1, plays: 67000, image: ALBUM_ART.GodIsGood, audio_url: '' },

  // ONE DAY - 19 tracks
  { id: 'od-01', title: 'The Intro', artist: 'O D Porter', album: 'One Day', duration: '1:45', price: 1, plays: 54000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-02', title: "Push'N", artist: 'O D Porter', album: 'One Day', duration: '3:12', price: 1, plays: 67000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-03', title: 'Real Definition', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 89000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-04', title: 'BandFlow', artist: 'O D Porter', album: 'One Day', duration: '3:33', price: 1, plays: 45000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-05', title: 'MFCCH', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 38000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-06', title: 'Best Wishes', artist: 'O D Porter', album: 'One Day', duration: '3:45', price: 1, plays: 52000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-07', title: 'One Day', artist: 'O D Porter', album: 'One Day', duration: '3:28', price: 1, plays: 125000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-08', title: 'Back At It', artist: 'O D Porter', album: 'One Day', duration: '3:15', price: 1, plays: 71000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-09', title: 'Same House', artist: 'O D Porter', album: 'One Day', duration: '4:22', price: 1, plays: 58000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-10', title: 'Sunshine', artist: 'O D Porter', album: 'One Day', duration: '3:01', price: 1, plays: 84000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-11', title: 'Calling For Me', artist: 'O D Porter', album: 'One Day', duration: '3:45', price: 1, plays: 61000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-12', title: 'GBK2', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 47000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-13', title: 'Artgasm', artist: 'O D Porter', album: 'One Day', duration: '4:15', price: 1, plays: 69000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-14', title: 'The Interlude', artist: 'O D Porter', album: 'One Day', duration: '1:32', price: 1, plays: 29000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-15', title: 'Silhouette', artist: 'O D Porter', album: 'One Day', duration: '3:48', price: 1, plays: 56000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-16', title: 'Street Love', artist: 'O D Porter', album: 'One Day', duration: '3:22', price: 1, plays: 92000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-17', title: 'Tracey Porter', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 43000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-18', title: 'Plus', artist: 'O D Porter', album: 'One Day', duration: '2:45', price: 1, plays: 38000, image: ALBUM_ART.OneDay, audio_url: '' },
  { id: 'od-19', title: 'Mike Tyson (One Round)', artist: 'O D Porter', album: 'One Day', duration: '3:15', price: 1, plays: 78000, image: ALBUM_ART.OneDay, audio_url: '' },

  // STREETS THOUGHT I LEFT - 9 tracks (O D Porter)
  { id: 'stl-01', title: 'Aint Gone Let Up', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '3:15', price: 1, plays: 125000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-02', title: 'Aired Em Out', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '2:45', price: 1, plays: 98000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-03', title: 'Forever Young', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '3:58', price: 1, plays: 76000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-04', title: 'Intro To My World', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '2:22', price: 1, plays: 89000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-05', title: 'Sometime', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '3:45', price: 1, plays: 54000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-06', title: 'Cutta Money', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '3:12', price: 1, plays: 67000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-07', title: 'Issues', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '4:01', price: 1, plays: 45000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-08', title: 'Bounce Dat Azz', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '2:58', price: 1, plays: 82000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },
  { id: 'stl-09', title: 'On Errthang', artist: 'O D Porter', album: 'Streets Thought I Left', duration: '3:33', price: 1, plays: 71000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: '' },

  // ROXANNITY - 9 tracks (track 10 not available on CDN)
  { id: 'rox-01', title: 'Roxannity (Intro)', artist: 'O D Porter', album: 'Roxannity', duration: '3:23', price: 1, plays: 54000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-02', title: 'Decomposure', artist: 'O D Porter', album: 'Roxannity', duration: '2:17', price: 1, plays: 42000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-03', title: 'Freak Like Me', artist: 'O D Porter', album: 'Roxannity', duration: '3:40', price: 1, plays: 78000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-04', title: 'Spoken Wordz', artist: 'O D Porter', album: 'Roxannity', duration: '3:56', price: 1, plays: 51000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-05', title: 'Heart & Soul', artist: 'O D Porter', album: 'Roxannity', duration: '2:31', price: 1, plays: 65000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-06', title: 'No More', artist: 'O D Porter', album: 'Roxannity', duration: '1:29', price: 1, plays: 89000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-07', title: 'Gotta Get It', artist: 'O D Porter', album: 'Roxannity', duration: '2:33', price: 1, plays: 47000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-08', title: 'Job', artist: 'O D Porter', album: 'Roxannity', duration: '2:14', price: 1, plays: 32000, image: ALBUM_ART.Roxannity, audio_url: '' },
  { id: 'rox-09', title: 'Pure Lust', artist: 'O D Porter', album: 'Roxannity', duration: '3:29', price: 1, plays: 58000, image: ALBUM_ART.Roxannity, audio_url: '' },
  // Note: Track 10 "Roxanne" not available on CDN

  // ARTGASM - 2 tracks
  { id: 'art-01', title: 'Good Bye Kisses', artist: 'O D Porter', album: 'Artgasm', duration: '3:15', price: 1, plays: 34000, image: ALBUM_ART.Artgasm, audio_url: '' },
  { id: 'art-02', title: 'Twerk-A-Thon 2', artist: 'O D Porter', album: 'Artgasm', duration: '4:22', price: 1, plays: 28000, image: ALBUM_ART.Artgasm, audio_url: '' },

  // LEVI - 9 tracks (O D Porter)
  { id: 'lev-01', title: 'Decomposure (LEVI)', artist: 'O D Porter', album: 'Levi', duration: '2:45', price: 1, plays: 45000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-02', title: 'Hero', artist: 'O D Porter', album: 'Levi', duration: '4:01', price: 1, plays: 67000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-03', title: 'Keep It Real', artist: 'O D Porter', album: 'Levi', duration: '3:22', price: 1, plays: 52000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-04', title: 'Lifestyle', artist: 'O D Porter', album: 'Levi', duration: '3:45', price: 1, plays: 58000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-05', title: 'Lust', artist: 'O D Porter', album: 'Levi', duration: '2:58', price: 1, plays: 41000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-06', title: 'No Limits', artist: 'O D Porter', album: 'Levi', duration: '4:12', price: 1, plays: 63000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-07', title: 'Only Real Niggaz', artist: 'O D Porter', album: 'Levi', duration: '3:55', price: 1, plays: 47000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-08', title: 'Pain', artist: 'O D Porter', album: 'Levi', duration: '3:28', price: 1, plays: 39000, image: ALBUM_ART.Levi, audio_url: '' },
  { id: 'lev-09', title: 'Struggle', artist: 'O D Porter', album: 'Levi', duration: '4:45', price: 1, plays: 55000, image: ALBUM_ART.Levi, audio_url: '' },
  // GUNE TRACKS
  { id: 'gune-01', title: 'Call Back', artist: 'Gune', album: 'Singles', duration: '2:30', price: 1, plays: 0, image: '/artist-images/gune/avatar.jpg', audio_url: '', featured: true },
  { id: 'gune-02', title: 'Sorry in Advance', artist: 'Gune', album: 'Singles', duration: '3:12', price: 1, plays: 0, image: '/artist-images/gune/avatar.jpg', audio_url: '' },
  { id: 'gune-03', title: 'One More Time', artist: 'Gune', album: 'Singles', duration: '2:58', price: 1, plays: 999999, image: '/artist-images/gune/avatar.jpg', audio_url: '', featured: true },
  // O D PORTER SINGLES
  { id: 'od-tlf', title: 'TLF', artist: 'O D Porter', album: 'Singles', duration: '3:30', price: 1, plays: 0, image: '/artist-images/od-porter/avatar.jpg', audio_url: '' },
  // NIKEE TURBO TRACKS
  { id: 'nikee-01', title: 'Dominique', artist: 'Nikee Turbo', album: 'Singles', duration: '2:45', price: 1, plays: 0, image: '/artist-images/nikee-turbo/avatar.jpg', audio_url: '', featured: true },
  { id: 'nikee-02', title: 'Harder', artist: 'Nikee Turbo', album: 'Singles', duration: '3:20', price: 1, plays: 0, image: '/artist-images/nikee-turbo/avatar.jpg', audio_url: '' },
  { id: 'nikee-03', title: 'Hide The Pain', artist: 'Nikee Turbo', album: 'Singles', duration: '2:55', price: 1, plays: 0, image: '/artist-images/nikee-turbo/avatar.jpg', audio_url: '' },
  // ATM TRAP TRACKS
  { id: 'atm-01', title: 'Thought We Was Bruddaz', artist: 'ATM Trap', album: 'Singles', duration: '3:42', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: '', featured: true },
  { id: 'atm-02', title: 'Coming Home', artist: 'ATM Trap', album: 'Singles', duration: '3:30', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: '' },
  { id: 'atm-03', title: 'Heart of a Lion', artist: 'ATM Trap', album: 'Singles', duration: '3:15', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: '' },
  { id: 'atm-04', title: 'Wacked Out Master', artist: 'ATM Trap', album: 'Singles', duration: '2:58', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: '' },

  // ROB SOULE TRACKS
  { id: 'rob-01', title: 'Believe In Me', artist: 'Rob Soule', album: 'Believe In Me', duration: '3:45', price: 1, plays: 0, image: '/artist-images/rob-soule/avatar.jpg', audio_url: '', featured: true },
  { id: 'rob-02', title: 'Ride N Vibe', artist: 'Rob Soule', album: 'Ride N Vibe', duration: '4:10', price: 1, plays: 0, image: '/artist-images/rob-soule/avatar.jpg', audio_url: '' },
  { id: 'rob-03', title: 'Roots', artist: 'Rob Soule', album: 'Roots', duration: '4:25', price: 1, plays: 0, image: '/artist-images/rob-soule/avatar.jpg', audio_url: '' },
];

// Album data
export const ALBUMS = {
  ambiguous: { id: 'ambiguous', name: 'Ambiguous', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Ambiguous, tracks: 21 },
  fromFeastToFamine: { id: 'from-feast-to-famine', name: 'From Feast to Famine', artist: 'O D Porter', year: 2023, image: ALBUM_ART.FromFeastToFamine, tracks: 10 },
  godIsGood: { id: 'god-is-good', name: 'God Is Good', artist: 'O D Porter', year: 2023, image: ALBUM_ART.GodIsGood, tracks: 9 },
  oneDay: { id: 'one-day', name: 'One Day', artist: 'O D Porter', year: 2024, image: ALBUM_ART.OneDay, tracks: 19 },
  streetsThoughtILeft: { id: 'streets-thought-i-left', name: 'Streets Thought I Left', artist: 'O D Porter', year: 2023, image: ALBUM_ART.StreetsThoughtILeft, tracks: 9 },
  roxannity: { id: 'roxannity', name: 'Roxannity', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Roxannity, tracks: 9 },
  artgasm: { id: 'artgasm', name: 'Artgasm', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Artgasm, tracks: 2 },
  levi: { id: 'levi', name: 'Levi', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Levi, tracks: 9 },
};

export { audio };