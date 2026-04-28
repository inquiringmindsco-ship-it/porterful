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
  Roxanity: '/album-art/Roxanity.jpg',
  Artgasm: '/album-art/Artgasm.jpg',
  Levi: '/album-art/Levi.jpg',
  Singles: '/album-art/Singles.jpg',
};

// All tracks with CDN audio URLs
export const TRACKS = [
  // AMBIGUOUS - 21 tracks
  { id: 'amb-01', title: 'Oddysee', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 125000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 01 Oddysee.mp3'), track_number: 1 },
  { id: 'amb-02', title: 'Zarah', artist: 'O D Porter', album: 'Ambiguous', duration: '3:34', price: 1, plays: 89000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 02 Zarah.mp3'), track_number: 2 },
  { id: 'amb-03', title: 'Dopamines', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 67000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 03 Dopamines.mp3'), track_number: 3 },
  { id: 'amb-04', title: 'I Like All', artist: 'O D Porter', album: 'Ambiguous', duration: '4:04', price: 1, plays: 45000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 04 I Like All.mp3'), track_number: 4 },
  { id: 'amb-05', title: 'Danielles Dance', artist: 'O D Porter', album: 'Ambiguous', duration: '3:26', price: 1, plays: 72000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 05 Danielles Dance.mp3'), track_number: 5 },
  { id: 'amb-06', title: 'Make A Move', artist: 'O D Porter', album: 'Ambiguous', duration: '3:51', price: 1, plays: 152000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 06 Make A Move.mp3'), track_number: 6 },
  { id: 'amb-07', title: 'Pack Down', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 39000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 07 Pack Down.mp3'), track_number: 7 },
  { id: 'amb-08', title: 'Lust For Love', artist: 'O D Porter', album: 'Ambiguous', duration: '4:41', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 08 Lust For Love.mp3'), track_number: 8 },
  { id: 'amb-09', title: 'Oxymoron (Interlude)', artist: 'O D Porter', album: 'Ambiguous', duration: '2:42', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 09 Oxymoron (interlude).mp3'), track_number: 9 },
  { id: 'amb-10', title: 'Briauns House', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 48000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 10 Briauns House.mp3'), track_number: 10 },
  { id: 'amb-11', title: "Torys Total Trip", artist: 'O D Porter', album: 'Ambiguous', duration: '4:30', price: 1, plays: 39000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', "O D Music - Ambiguous - 11 Tory's Total Trip.mp3"), track_number: 11 },
  { id: 'amb-12', title: 'LeCole', artist: 'O D Porter', album: 'Ambiguous', duration: '4:36', price: 1, plays: 35000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 12 LeCole.mp3'), track_number: 12 },
  { id: 'amb-13', title: 'Cypher', artist: 'O D Porter', album: 'Ambiguous', duration: '4:22', price: 1, plays: 38000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 13 Cypher.mp3'), track_number: 13 },
  { id: 'amb-14', title: 'Bible', artist: 'O D Porter', album: 'Ambiguous', duration: '2:44', price: 1, plays: 34000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 14 Bible.mp3'), track_number: 14 },
  { id: 'amb-15', title: 'Dirty World', artist: 'O D Porter', album: 'Ambiguous', duration: '3:01', price: 1, plays: 43000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 15 Dirty World.mp3'), track_number: 15 },
  { id: 'amb-16', title: 'The Employee', artist: 'O D Porter', album: 'Ambiguous', duration: '4:00', price: 1, plays: 36000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 16 The Employee.mp3'), track_number: 16 },
  { id: 'amb-17', title: 'Veni Vidi Vici', artist: 'O D Porter', album: 'Ambiguous', duration: '2:30', price: 1, plays: 40000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 17 Veni Vidi Vici.mp3'), track_number: 17 },
  { id: 'amb-18', title: 'Pack Down (Remix)', artist: 'O D Porter', album: 'Ambiguous', duration: '4:29', price: 1, plays: 27000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 18 Pack Down (Remix).mp3'), track_number: 18 },
  { id: 'amb-19', title: 'Lil Playa', artist: 'O D Porter', album: 'Ambiguous', duration: '2:57', price: 1, plays: 60000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 19 Lil Playa.mp3'), track_number: 19 },
  { id: 'amb-20', title: 'Nostalgism', artist: 'O D Porter', album: 'Ambiguous', duration: '3:02', price: 1, plays: 31000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 20 Nostalgism.mp3'), track_number: 20 },
  { id: 'amb-21', title: 'Enlightened', artist: 'O D Porter', album: 'Ambiguous', duration: '3:40', price: 1, plays: 28000, image: ALBUM_ART.Ambiguous, audio_url: audio('Ambiguous', 'O D Music - Ambiguous - 21 Enlightened.mp3'), track_number: 21 },

  // FROM FEAST TO FAMINE - 10 tracks
  { id: 'fff-01', title: 'Intro', artist: 'O D Porter', album: 'From Feast to Famine', duration: '1:23', price: 1, plays: 45000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '01 Intro.mp3'), track_number: 1 },
  { id: 'fff-02', title: 'Breathe', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:42', price: 1, plays: 89000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '02 Breathe.mp3'), track_number: 2 },
  { id: 'fff-03', title: 'Heal', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:15', price: 1, plays: 67000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '03 Heal.mp3'), track_number: 3 },
  { id: 'fff-04', title: 'Feel This Pain', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:58', price: 1, plays: 52000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '04 Feel This Pain.mp3'), track_number: 4 },
  { id: 'fff-05', title: 'Ride', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:21', price: 1, plays: 71000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '05 Ride.mp3'), track_number: 5 },
  { id: 'fff-06', title: 'yOurs', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:14', price: 1, plays: 58000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '06 yOurs.mp3'), track_number: 6 },
  { id: 'fff-07', title: 'Trust', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:12', price: 1, plays: 64000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '07 Trust.mp3'), track_number: 7 },
  { id: 'fff-08', title: 'Funeral', artist: 'O D Porter', album: 'From Feast to Famine', duration: '5:23', price: 1, plays: 42000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '08 Funeral.mp3'), track_number: 8 },
  { id: 'fff-09', title: 'Unchained Melodies', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:56', price: 1, plays: 83000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '09 Unchained Melodies.mp3'), track_number: 9 },
  { id: 'fff-10', title: 'Change Up', artist: 'O D Porter', album: 'From Feast to Famine', duration: '2:51', price: 1, plays: 29000, image: ALBUM_ART.FromFeastToFamine, audio_url: audio('FromFeastToFamine', '10 Change Up (Outro).mp3'), track_number: 10 },

  // GOD IS GOOD - 12 tracks (RESTORED to working CDN filenames)
  { id: 'gig-01', title: 'God is Good', artist: 'O D Porter', album: 'God Is Good', duration: '2:28', price: 1, plays: 92000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '01 God is Good (Intro).mp3'), track_number: 1 },
  { id: 'gig-02', title: 'Amen', artist: 'O D Porter', album: 'God Is Good', duration: '4:32', price: 1, plays: 125000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '02 Amen.mp3'), track_number: 2 },
  { id: 'gig-03', title: 'Dream World', artist: 'O D Porter', album: 'God Is Good', duration: '2:03', price: 1, plays: 78000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '03 DreamWorld.mp3'), track_number: 3 },
  { id: 'gig-04', title: 'The Untold Story', artist: 'O D Porter', album: 'God Is Good', duration: '3:30', price: 1, plays: 65000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '05 The Untold Story 2.mp3'), track_number: 4 },
  { id: 'gig-05', title: 'The Pain', artist: 'O D Porter', album: 'God Is Good', duration: '3:05', price: 1, plays: 48000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '06 The Pain.mp3'), track_number: 5 },
  { id: 'gig-06', title: 'When GOD Cry', artist: 'O D Porter', album: 'God Is Good', duration: '3:38', price: 1, plays: 56000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '07 When GOD Cry 2.mp3'), track_number: 6 },
  { id: 'gig-07', title: 'More or Less', artist: 'O D Porter', album: 'God Is Good', duration: '4:40', price: 1, plays: 45000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '08 More or Less.mp3'), track_number: 7 },
  { id: 'gig-08', title: 'TBT', artist: 'O D Porter', album: 'God Is Good', duration: '3:37', price: 1, plays: 89000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '09 TBT.mp3'), track_number: 8 },
  { id: 'gig-09', title: 'Miscommunication', artist: 'O D Porter', album: 'God Is Good', duration: '2:41', price: 1, plays: 67000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '10 Miscommuinication 2.mp3'), track_number: 9 },
  { id: 'gig-10', title: 'Shadows', artist: 'O D Porter', album: 'God Is Good', duration: '2:13', price: 1, plays: 38000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '11 Shadows .mp3'), track_number: 10 },
  { id: 'gig-11', title: 'Rich Niggaz', artist: 'O D Porter', album: 'God Is Good', duration: '2:13', price: 1, plays: 89000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '12 Rich Niggaz.mp3'), track_number: 11 },
  { id: 'gig-12', title: 'Goddess to Me SD 480p', artist: 'O D Porter', album: 'God Is Good', duration: '4:37', price: 1, plays: 71000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', '14 Goddess to Me SD 480p.mp3'), track_number: 12 },
  { id: 'gig-13', title: "C'est La Vie", artist: 'O D Porter', album: 'God Is Good', duration: '3:45', price: 1, plays: 71000, image: ALBUM_ART.GodIsGood, audio_url: audio('GodIsGood', "13 C'est La Vie.mp3"), track_number: 13 },

  // ONE DAY - 19 tracks
  { id: 'od-01', title: 'Intro', artist: 'O D Porter', album: 'One Day', duration: '1:32', price: 1, plays: 54000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 01 The Intro.mp3'), track_number: 1 },
  { id: 'od-02', title: "Push'N", artist: 'O D Porter', album: 'One Day', duration: '3:12', price: 1, plays: 67000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', "O D Music - One Day - 02 Push'N.mp3"), track_number: 2 },
  { id: 'od-03', title: 'Real Definition', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 89000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 03 Real Definition.mp3'), track_number: 3 },
  { id: 'od-04', title: 'Band Flow', artist: 'O D Porter', album: 'One Day', duration: '3:05', price: 1, plays: 45000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', "O D Music - One Day - 04 Band Flow.mp3"), track_number: 4 },
  { id: 'od-05', title: 'MFCCH', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 38000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 05 MFCCH.mp3'), track_number: 5 },
  { id: 'od-06', title: 'Best Wishes', artist: 'O D Porter', album: 'One Day', duration: '3:45', price: 1, plays: 52000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 06 Best Wishes.mp3'), track_number: 6 },
  { id: 'od-07', title: 'One Day', artist: 'O D Porter', album: 'One Day', duration: '3:28', price: 1, plays: 125000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 07 One Day.mp3'), track_number: 7 },
  { id: 'od-08', title: 'Back At It SD 480p', artist: 'O D Porter', album: 'One Day', duration: '4:19', price: 1, plays: 71000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 08 Back At It.mp3'), track_number: 8 },
  { id: 'od-09', title: 'Same House', artist: 'O D Porter', album: 'One Day', duration: '4:22', price: 1, plays: 58000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 09 Same House.mp3'), track_number: 9 },
  { id: 'od-10', title: 'Sunshine', artist: 'O D Porter', album: 'One Day', duration: '3:01', price: 1, plays: 84000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 10 Sunshine.mp3'), track_number: 10 },
  { id: 'od-11', title: 'Calling For Me', artist: 'O D Porter', album: 'One Day', duration: '3:57', price: 1, plays: 61000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 11 Calling For Me.mp3'), track_number: 11 },
  { id: 'od-12', title: 'Good Bye Kisses 2', artist: 'O D Porter', album: 'One Day', duration: '4:11', price: 1, plays: 45000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', '12 Good Bye Kisses 2.mp3'), track_number: 12 },
  { id: 'od-13', title: 'GBK2', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 47000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 13 GBK2.mp3'), track_number: 13 },
  { id: 'od-14', title: 'The Interlude', artist: 'O D Porter', album: 'One Day', duration: '1:32', price: 1, plays: 29000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 14 The Interlude.mp3'), track_number: 14 },
  { id: 'od-15', title: 'Silhouette', artist: 'O D Porter', album: 'One Day', duration: '3:48', price: 1, plays: 56000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 15 Silhouette.mp3'), track_number: 15 },
  { id: 'od-16', title: 'Street Love', artist: 'O D Porter', album: 'One Day', duration: '3:22', price: 1, plays: 92000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 16 Street Love.mp3'), track_number: 16 },
  { id: 'od-17', title: 'Tracey Porter', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 43000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 17 Tracey Porter.mp3'), track_number: 17 },
  { id: 'od-18', title: 'Plus', artist: 'O D Porter', album: 'One Day', duration: '2:45', price: 1, plays: 38000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 18 Plus.mp3'), track_number: 18 },
  { id: 'od-19', title: 'Mike Tyson (One Round)', artist: 'O D Porter', album: 'One Day', duration: '3:15', price: 1, plays: 78000, image: ALBUM_ART.OneDay, audio_url: audio('OneDay', 'O D Music - One Day - 19 Mike Tyson (One Round).mp3'), track_number: 19 },

  // STREETS THOUGHT I LEFT - 10 tracks (Jai Jai - different from O D Porter)
  { id: 'stl-01', title: 'Aint Gone Let Up', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:15', price: 1, plays: 125000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Aint Gone Let Up.mp3'), track_number: 1 },
  { id: 'stl-02', title: 'Aired Em Out', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '2:45', price: 1, plays: 98000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Aired Em Out.mp3'), track_number: 2 },
  { id: 'stl-03', title: 'Forever Young', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:58', price: 1, plays: 76000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Forever Young.mp3'), track_number: 3 },
  { id: 'stl-04', title: 'Intro To My World', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '2:22', price: 1, plays: 89000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Intro To My World.mp3'), track_number: 4 },
  { id: 'stl-05', title: 'Sometimes', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:45', price: 1, plays: 54000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', "Jai Jai - Sometimes.mp3"), track_number: 5 },
  { id: 'stl-06', title: 'Cutta Money', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:12', price: 1, plays: 67000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Cutta Money.mp3'), track_number: 6 },
  { id: 'stl-07', title: 'Issues', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '4:01', price: 1, plays: 45000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Issues.mp3'), track_number: 7 },
  { id: 'stl-08', title: 'Bounce Dat Azz', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '2:58', price: 1, plays: 82000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - Bounce Dat Azz.mp3'), track_number: 8 },
  { id: 'stl-09', title: 'On Errthang', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:33', price: 1, plays: 71000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', 'Jai Jai - On Errthang.mp3'), track_number: 9 },
  { id: 'stl-10', title: '18 Facts Of Life', artist: 'Jay Jay', album: 'Streets Thought I Left', duration: '3:45', price: 1, plays: 55000, image: ALBUM_ART.StreetsThoughtILeft, audio_url: audio('StreetsThoughtILef', '18 18 Facts Of Life.mp3'), track_number: 10 },

  // ROXANITY - 16 tracks (track 9 is We The Shh Now)
  { id: 'rox-01', title: 'Roxanne', artist: 'O D Porter', album: 'Roxanity', duration: '3:23', price: 1, plays: 54000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '01 Roxanity (Intro).mp3'), track_number: 1 },
  { id: 'rox-02', title: 'Decomposure', artist: 'O D Porter', album: 'Roxanity', duration: '2:17', price: 1, plays: 42000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '02 Decomposure.mp3'), track_number: 2 },
  { id: 'rox-03', title: 'Freak Like Me', artist: 'O D Porter', album: 'Roxanity', duration: '3:40', price: 1, plays: 78000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '03 Freak Like Me.mp3'), track_number: 3 },
  { id: 'rox-04', title: 'Spoken Word', artist: 'O D Porter', album: 'Roxanity', duration: '3:56', price: 1, plays: 51000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '04 Spoken Word.mp3'), track_number: 4 },
  { id: 'rox-05', title: 'Love For Music', artist: 'O D Porter', album: 'Roxanity', duration: '2:32', price: 1, plays: 65000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '05 Heart & Soul.mp3'), track_number: 5 },
  { id: 'rox-06', title: 'No More', artist: 'O D Porter', album: 'Roxanity', duration: '1:29', price: 1, plays: 89000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '06 No More.mp3'), track_number: 6 },
  { id: 'rox-07', title: 'I Gotta Get It', artist: 'O D Porter', album: 'Roxanity', duration: '2:33', price: 1, plays: 47000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '07 Gotta Get It.mp3'), track_number: 7 },
  { id: 'rox-08', title: 'Job', artist: 'O D Porter', album: 'Roxanity', duration: '2:14', price: 1, plays: 32000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '08 Job.mp3'), track_number: 8 },
  { id: 'rox-09', title: 'We The Shh Now', artist: 'O D Porter', album: 'Roxanity', duration: '3:14', price: 1, plays: 62000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '09 We The Shh.mp3'), track_number: 9 },
  { id: 'rox-10', title: 'GBK Good By Kisses', artist: 'O D Porter', album: 'Roxanity', duration: '1:51', price: 1, plays: 58000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '10 GBK Good By Kisses.mp3'), track_number: 10 },
  { id: 'rox-11', title: 'Red Pill', artist: 'O D Porter', album: 'Roxanity', duration: '3:06', price: 1, plays: 41000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '11 Red Pill or The Blue.mp3'), track_number: 11 },
  { id: 'rox-12', title: 'Nightmare', artist: 'O D Porter', album: 'Roxanity', duration: '3:15', price: 1, plays: 38000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '12 Nightmare.mp3'), track_number: 12 },
  { id: 'rox-13', title: 'Only One In Love', artist: 'O D Porter', album: 'Roxanity', duration: '3:04', price: 1, plays: 52000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '13 Only One In Love.mp3'), track_number: 13 },
  { id: 'rox-14', title: 'Stop', artist: 'O D Porter', album: 'Roxanity', duration: '4:05', price: 1, plays: 44000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '14 STOP.mp3'), track_number: 14 },
  { id: 'rox-15', title: 'Rose', artist: 'O D Porter', album: 'Roxanity', duration: '2:30', price: 1, plays: 36000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '15 Rose.mp3'), track_number: 15 },
  { id: 'rox-16', title: 'Testimony', artist: 'O D Porter', album: 'Roxanity', duration: '2:30', price: 1, plays: 36000, image: ALBUM_ART.Roxanity, audio_url: audio('Roxanity', '16 Testimony.mp3'), track_number: 16 },

  // ARTGASM - REMOVED: empty audio files
  // { id: 'art-01', title: 'Good Bye Kisses', artist: 'O D Porter', album: 'Artgasm', duration: '3:15', price: 1, plays: 34000, image: ALBUM_ART.Artgasm, audio_url: '' },
  // { id: 'art-02', title: 'Twerk-A-Thon 2', artist: 'O D Porter', album: 'Artgasm', duration: '4:22', price: 1, plays: 28000, image: ALBUM_ART.Artgasm, audio_url: '' },

  // LEVI - 9 tracks (Jai Jai - different from O D Porter)
  { id: 'lev-01', title: 'Decomposure', artist: 'Jay Jay', album: 'Levi', duration: '2:45', price: 1, plays: 45000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Decomposure (LEVI 501 Vol.1).mp3'), track_number: 1 },
  { id: 'lev-02', title: 'Hero', artist: 'Jay Jay', album: 'Levi', duration: '4:01', price: 1, plays: 67000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Hero (LEVI 501 Vol.1).mp3'), track_number: 2 },
  { id: 'lev-03', title: 'Keep It Real', artist: 'Jay Jay', album: 'Levi', duration: '3:22', price: 1, plays: 52000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Keep It Real (LEVI 501 Vol.1).mp3'), track_number: 3 },
  { id: 'lev-04', title: 'Lifestyle', artist: 'Jay Jay', album: 'Levi', duration: '3:45', price: 1, plays: 58000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Lifestyle (LEVI 501 Vol.1).mp3'), track_number: 4 },
  { id: 'lev-05', title: 'Lust', artist: 'Jay Jay', album: 'Levi', duration: '2:58', price: 1, plays: 41000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Lust (LEVI 501 Vol.1).mp3'), track_number: 5 },
  { id: 'lev-06', title: 'No Limits', artist: 'Jay Jay', album: 'Levi', duration: '4:12', price: 1, plays: 63000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - No Limits (LEVI 501 Vol.1).mp3'), track_number: 6 },
  { id: 'lev-07', title: 'Only Real Niggaz', artist: 'Jay Jay', album: 'Levi', duration: '3:55', price: 1, plays: 47000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Only Real Niggaz (LEVI 501 Vol.1).mp3'), track_number: 7 },
  { id: 'lev-08', title: 'Outsider', artist: 'Jay Jay', album: 'Levi', duration: '3:28', price: 1, plays: 39000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Outsider (LEVI 501 Vol.1).mp3'), track_number: 8 },
  { id: 'lev-09', title: 'Spoken Word', artist: 'Jay Jay', album: 'Levi', duration: '4:45', price: 1, plays: 55000, image: ALBUM_ART.Levi, audio_url: audio('Levi', 'Jai Jai - Spoken Word (LEVI 501 Vol.1).mp3'), track_number: 9 },
  // GUNE TRACKS
  { id: 'gune-01', title: 'Call Back', artist: 'Gune', album: 'Singles', duration: '2:30', price: 1, plays: 0, image: '/artist-images/gune/avatar.jpg', audio_url: artistAudio('gune', 'call-back.mp3'), featured: true },
  { id: 'gune-02', title: 'Sorry in Advance', artist: 'Gune', album: 'Singles', duration: '3:12', price: 1, plays: 0, image: '/artist-images/gune/avatar.jpg', audio_url: artistAudio('gune', 'sorry-in-advance.mp3') },
  { id: 'gune-03', title: 'One More Time', artist: 'Gune', album: 'Singles', duration: '2:58', price: 1, plays: 999999, image: '/artist-images/gune/avatar.jpg', audio_url: artistAudio('gune', 'one-more-time.mp3'), featured: true },
  // O D PORTER SINGLES
  { id: 'od-s01', title: 'Too Stingy', artist: 'O D Porter', album: 'Singles', duration: '3:45', price: 1, plays: 89000, image: ALBUM_ART.Singles, audio_url: audio('Singles', '01 Too Stingy.mp3') },
  { id: 'od-s02', title: 'After Effects', artist: 'O D Porter', album: 'Singles', duration: '3:12', price: 1, plays: 67000, image: ALBUM_ART.Singles, audio_url: audio('Singles', 'After Effects.mp3') },
  { id: 'od-s03', title: 'TLF', artist: 'O D Porter', album: 'Singles', duration: '4:01', price: 1, plays: 45000, image: ALBUM_ART.Singles, audio_url: audio('Singles', '01 TLF.mp3') },
  { id: 'od-s04', title: 'Time', artist: 'O D Porter', album: 'Singles', duration: '3:33', price: 1, plays: 52000, image: ALBUM_ART.Singles, audio_url: audio('Singles', 'Time.mp3') },
  { id: 'od-s05', title: 'Kuato Ft Rick & Morty', artist: 'O D Porter', album: 'Singles', duration: '4:15', price: 1, plays: 38000, image: ALBUM_ART.Singles, audio_url: audio('Singles', 'O D Porter - Kuato Ft. Rick & Morty.mp3') },
  { id: 'od-s06', title: '2BC BOUNCE', artist: 'O D Porter', album: 'Singles', duration: '3:28', price: 1, plays: 71000, image: ALBUM_ART.Singles, audio_url: audio('Singles', '2BC BOUNCE.mp3') },
  { id: 'od-s07', title: 'around 3', artist: 'O D Porter', album: 'Singles', duration: '4:31', price: 1, plays: 55000, image: ALBUM_ART.Singles, audio_url: audio('Singles', 'around 3 (Master 2.0).mp3') },
  // ATM TRAP TRACKS
  { id: 'atm-01', title: 'Thought We Was Bruddaz', artist: 'ATM Trap', album: 'Singles', duration: '3:42', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: artistAudio('atm-trap', 'thought-we-was-bruddaz.mp3'), featured: true },
  { id: 'atm-02', title: 'Coming Home', artist: 'ATM Trap', album: 'Singles', duration: '4:20', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: artistAudio('atm-trap', 'coming-home.mp3') },
  { id: 'atm-03', title: 'Heart of a Lion', artist: 'ATM Trap', album: 'Singles', duration: '2:28', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: artistAudio('atm-trap', 'heart-of-a-lion.mp3') },
  { id: 'atm-04', title: 'Wacked Out', artist: 'ATM Trap', album: 'Singles', duration: '3:30', price: 1, plays: 0, image: '/artist-images/atm-trap/avatar.jpg', audio_url: artistAudio('atm-trap', 'wacked-out.mp3') },
];

// Album data
export const ALBUMS = {
  ambiguous: { id: 'ambiguous', name: 'Ambiguous', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Ambiguous, tracks: 21 },
  fromFeastToFamine: { id: 'from-feast-to-famine', name: 'From Feast to Famine', artist: 'O D Porter', year: 2023, image: ALBUM_ART.FromFeastToFamine, tracks: 10 },
  godIsGood: { id: 'god-is-good', name: 'God Is Good', artist: 'O D Porter', year: 2023, image: ALBUM_ART.GodIsGood, tracks: 13 },
  oneDay: { id: 'one-day', name: 'One Day', artist: 'O D Porter', year: 2024, image: ALBUM_ART.OneDay, tracks: 19 },
  streetsThoughtILeft: { id: 'streets-thought-i-left', name: 'Streets Thought I Left', artist: 'O D Porter', year: 2023, image: ALBUM_ART.StreetsThoughtILeft, tracks: 9 },
  roxannity: { id: 'roxannity', name: 'Roxanity', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Roxanity, tracks: 16 },
  artgasm: { id: 'artgasm', name: 'Artgasm', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Artgasm, tracks: 2 },
  levi: { id: 'levi', name: 'Levi', artist: 'O D Porter', year: 2024, image: ALBUM_ART.Levi, tracks: 9 },
};

export { audio };