// CDN base URL for audio files
const CDN = 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/audio/albums';

// Audio URL helper - handles URL encoding
const audio = (album: string, file: string) => `${CDN}/${album}/${encodeURIComponent(file)}`;

// Products for marketplace
export const PRODUCTS = [
  { id: 'ambiguous-tee', name: 'Ambiguous Tour Tee', artist: 'O D Porter', price: 28, category: 'merch', type: 'Apparel', description: 'Premium cotton tee from the Ambiguous tour.', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', colors: ['Black', 'White', 'Orange'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], inStock: true, artistCut: 22.40, sales: 142, rating: 4.8, reviews: 89 },
  { id: 'ambiguous-hoodie', name: 'Ambiguous Hoodie', artist: 'O D Porter', price: 65, category: 'merch', type: 'Apparel', description: 'Heavyweight hoodie with embroidered logo.', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500', colors: ['Black', 'Gray'], sizes: ['S', 'M', 'L', 'XL'], inStock: true, artistCut: 52, sales: 78, rating: 4.9, reviews: 45 },
  { id: 'ambiguous-vinyl', name: 'Ambiguous Vinyl', artist: 'O D Porter', price: 35, category: 'music', type: 'Vinyl', description: 'Limited edition vinyl. 180g audiophile quality.', image: 'https://images.unsplash.com/photo-1539185441755-7697f0f1e3ee?w=500', format: '12" Vinyl', tracks: 21, inStock: true, artistCut: 28, sales: 234, rating: 5.0, reviews: 67 },
];

// All tracks with CDN audio URLs
export const TRACKS = [
  // AMBIGUOUS - 21 tracks (CDN verified)
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

  // FROM FEAST TO FAMINE - 15 tracks (CDN verified)
  { id: 'fff-01', title: 'Intro', artist: 'O D Porter', album: 'From Feast to Famine', duration: '1:23', price: 1, plays: 45000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '01_Intro.mp3') },
  { id: 'fff-02', title: 'Breathe', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:42', price: 1, plays: 89000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '02_Breathe.mp3') },
  { id: 'fff-03', title: 'Heal', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:15', price: 1, plays: 67000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '03_Heal.mp3') },
  { id: 'fff-04', title: 'Feel This Pain', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:58', price: 1, plays: 52000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '04_Feel_This_Pain.mp3') },
  { id: 'fff-05', title: 'Ride', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:21', price: 1, plays: 71000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '05_Ride.mp3') },
  { id: 'fff-06', title: 'IJKFBO', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:45', price: 1, plays: 58000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '06_IJKFBO.mp3') },
  { id: 'fff-07', title: 'Trust', artist: 'O D Porter', album: 'From Feast to Famine', duration: '4:12', price: 1, plays: 64000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '07_Trust.mp3') },
  { id: 'fff-08', title: 'Funeral', artist: 'O D Porter', album: 'From Feast to Famine', duration: '5:23', price: 1, plays: 42000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '08_Funeral.mp3') },
  { id: 'fff-09', title: 'Unchained Melodies', artist: 'O D Porter', album: 'From Feast to Famine', duration: '3:56', price: 1, plays: 83000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '09_Unchained_Melodies.mp3') },
  { id: 'fff-10', title: 'Change Up (Outro)', artist: 'O D Porter', album: 'From Feast to Famine', duration: '2:18', price: 1, plays: 29000, image: '/album-art/FromFeastToFamine.jpg', audio_url: audio('FromFeastToFamine', '10_Change_Up__Outro_.mp3') },

  // GOD IS GOOD - 9 tracks (CDN verified)
  { id: 'gig-01', title: 'God is Good (Intro)', artist: 'O D Porter', album: 'God Is Good', duration: '2:30', price: 1, plays: 92000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '01_God_is_Good__Intro_.mp3') },
  { id: 'gig-02', title: 'DreamWorld', artist: 'O D Porter', album: 'God Is Good', duration: '3:45', price: 1, plays: 78000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '03_DreamWorld.mp3') },
  { id: 'gig-03', title: 'The Pain', artist: 'O D Porter', album: 'God Is Good', duration: '4:02', price: 1, plays: 65000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', '06_The_Pain.mp3') },
  { id: 'gig-04', title: 'Amen', artist: 'O D Porter', album: 'God Is Good', duration: '3:42', price: 1, plays: 125000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'Amen_2.mp3') },
  { id: 'gig-05', title: "C'est La Vie", artist: 'O D Porter', album: 'God Is Good', duration: '4:15', price: 1, plays: 89000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'C_est_La_Vie_2.mp3') },
  { id: 'gig-06', title: 'Miscommunication', artist: 'O D Porter', album: 'God Is Good', duration: '3:28', price: 1, plays: 56000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'Miscommuinication_2.mp3') },
  { id: 'gig-07', title: 'TBT', artist: 'O D Porter', album: 'God Is Good', duration: '2:45', price: 1, plays: 71000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'TBT_2.mp3') },
  { id: 'gig-08', title: 'The Untold Story', artist: 'O D Porter', album: 'God Is Good', duration: '4:32', price: 1, plays: 48000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'The_Untold_Story_2.mp3') },
  { id: 'gig-09', title: 'When GOD Cry', artist: 'O D Porter', album: 'God Is Good', duration: '5:01', price: 1, plays: 67000, image: '/album-art/GodIsGood.jpg', audio_url: audio('GodIsGood', 'When_GOD_Cry_2.mp3') },

  // ONE DAY - 19 tracks (CDN verified)
  { id: 'od-01', title: 'The Intro', artist: 'O D Porter', album: 'One Day', duration: '1:45', price: 1, plays: 54000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '01_The_Intro.mp3') },
  { id: 'od-02', title: "Push'N", artist: 'O D Porter', album: 'One Day', duration: '3:12', price: 1, plays: 67000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '02_Push_N.mp3') },
  { id: 'od-03', title: 'Real Definition', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 89000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '03_Real_Definition.mp3') },
  { id: 'od-04', title: 'BandFlow', artist: 'O D Porter', album: 'One Day', duration: '3:33', price: 1, plays: 45000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '04_BandFlow.mp3') },
  { id: 'od-05', title: 'MFCCH', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 38000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '05_MFCCH.mp3') },
  { id: 'od-06', title: 'Best Wishes', artist: 'O D Porter', album: 'One Day', duration: '3:45', price: 1, plays: 52000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '06_Best_Wishes.mp3') },
  { id: 'od-07', title: 'One Day', artist: 'O D Porter', album: 'One Day', duration: '3:28', price: 1, plays: 125000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '07_One_Day.mp3') },
  { id: 'od-08', title: 'Back At It', artist: 'O D Porter', album: 'One Day', duration: '3:15', price: 1, plays: 71000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '08_Back_At_It.mp3') },
  { id: 'od-09', title: 'Same House', artist: 'O D Porter', album: 'One Day', duration: '4:22', price: 1, plays: 58000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '09_Same_House.mp3') },
  { id: 'od-10', title: 'Sunshine', artist: 'O D Porter', album: 'One Day', duration: '3:01', price: 1, plays: 84000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '10_Sunshine.mp3') },
  { id: 'od-11', title: 'Calling For Me', artist: 'O D Porter', album: 'One Day', duration: '3:45', price: 1, plays: 61000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '11_Calling_For_Me.mp3') },
  { id: 'od-12', title: 'GBK2', artist: 'O D Porter', album: 'One Day', duration: '2:58', price: 1, plays: 47000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '12_GBK2.mp3') },
  { id: 'od-13', title: 'Artgasm', artist: 'O D Porter', album: 'One Day', duration: '4:15', price: 1, plays: 69000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '13_Artgasm.mp3') },
  { id: 'od-14', title: 'The Interlude', artist: 'O D Porter', album: 'One Day', duration: '1:32', price: 1, plays: 29000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '14_The_Interlude.mp3') },
  { id: 'od-15', title: 'Silhouette', artist: 'O D Porter', album: 'One Day', duration: '3:48', price: 1, plays: 56000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '15_Silhouette.mp3') },
  { id: 'od-16', title: 'Street Love', artist: 'O D Porter', album: 'One Day', duration: '3:22', price: 1, plays: 92000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '16_Street_Love.mp3') },
  { id: 'od-17', title: 'Tracey Porter', artist: 'O D Porter', album: 'One Day', duration: '4:01', price: 1, plays: 43000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '17_Tracey_Porter.mp3') },
  { id: 'od-18', title: 'Plus', artist: 'O D Porter', album: 'One Day', duration: '2:45', price: 1, plays: 38000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '18_Plus.mp3') },
  { id: 'od-19', title: 'Mike Tyson (One Round)', artist: 'O D Porter', album: 'One Day', duration: '3:15', price: 1, plays: 78000, image: '/album-art/OneDay.jpg', audio_url: audio('OneDay', '19_Mike_Tyson__One_Round_.mp3') },

  // STREETS THOUGHT I LEFT - 9 tracks (CDN verified)
  { id: 'stl-01', title: 'Aint Gone Let Up', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:15', price: 1, plays: 125000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Aint_Gone_Let_Up.mp3') },
  { id: 'stl-02', title: 'Aired Em Out', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '2:45', price: 1, plays: 98000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Aired_Em_Out.mp3') },
  { id: 'stl-03', title: 'Forever Young', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:58', price: 1, plays: 76000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Forever_Young.mp3') },
  { id: 'stl-04', title: 'Intro To My World', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '2:22', price: 1, plays: 89000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-__Intro_To_My_World.mp3') },
  { id: 'stl-05', title: 'Sometime', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:45', price: 1, plays: 54000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Sometime.mp3') },
  { id: 'stl-06', title: 'Cutta Money', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:12', price: 1, plays: 67000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Cutta_Money.mp3') },
  { id: 'stl-07', title: 'Issues', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '4:01', price: 1, plays: 45000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Issues.mp3') },
  { id: 'stl-08', title: 'Bounce Dat Azz', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '2:58', price: 1, plays: 82000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_Bounce_Dat_Azz.mp3') },
  { id: 'stl-09', title: 'On Errthang', artist: 'Jai Jai', album: 'Streets Thought I Left', duration: '3:33', price: 1, plays: 71000, image: '/album-art/StreetsThoughtILeft.jpg', audio_url: audio('StreetsThoughtILeft', 'Jai_Jai_-_On_Errthang.mp3') },

  // ROXANNITY - 30 tracks (CDN verified)
  { id: 'rox-01', title: 'Roxannity (Intro)', artist: 'O D Porter', album: 'Roxannity', duration: '3:23', price: 1, plays: 54000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '01_Roxannity__Intro_.mp3') },
  { id: 'rox-02', title: 'Decomposure', artist: 'O D Porter', album: 'Roxannity', duration: '2:17', price: 1, plays: 42000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '02_Decomposure.mp3') },
  { id: 'rox-03', title: 'Freak Like Me', artist: 'O D Porter', album: 'Roxannity', duration: '3:40', price: 1, plays: 78000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '03_Freak_Like_Me.mp3') },
  { id: 'rox-04', title: 'Spoken Wordz', artist: 'O D Porter', album: 'Roxannity', duration: '3:56', price: 1, plays: 51000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '04_Spoken_Wordz.mp3') },
  { id: 'rox-05', title: 'Heart & Soul', artist: 'O D Porter', album: 'Roxannity', duration: '2:31', price: 1, plays: 65000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '05_Heart___Soul.mp3') },
  { id: 'rox-06', title: 'No More', artist: 'O D Porter', album: 'Roxannity', duration: '1:29', price: 1, plays: 89000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '06_No_More.mp3') },
  { id: 'rox-07', title: 'Gotta Get It', artist: 'O D Porter', album: 'Roxannity', duration: '2:33', price: 1, plays: 47000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '07_Gotta_Get_It.mp3') },
  { id: 'rox-08', title: 'Job', artist: 'O D Porter', album: 'Roxannity', duration: '2:14', price: 1, plays: 32000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '08_Job.mp3') },
  { id: 'rox-09', title: 'Pure Lust', artist: 'O D Porter', album: 'Roxannity', duration: '3:29', price: 1, plays: 58000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '09_Pure_Lust.mp3') },
  { id: 'rox-10', title: 'Roxanne', artist: 'O D Porter', album: 'Roxannity', duration: '3:45', price: 1, plays: 92000, image: '/album-art/Roxannity.jpg', audio_url: audio('Roxannity', '10_Roxanne.mp3') },

  // ARTGASM - 2 tracks (CDN verified)
  { id: 'art-01', title: 'Good Bye Kisses', artist: 'O D Porter', album: 'Artgasm', duration: '3:15', price: 1, plays: 34000, image: '/album-art/Artgasm.jpg', audio_url: audio('Artgasm', '01_Good_Bye_Kisses.mp3') },
  { id: 'art-02', title: 'Twerk-A-Thon 2', artist: 'O D Porter', album: 'Artgasm', duration: '4:22', price: 1, plays: 28000, image: '/album-art/Artgasm.jpg', audio_url: audio('Artgasm', 'Twerk-A-Thon_2.mp3') },

  // LEVI - 9 tracks (CDN verified)
  { id: 'lev-01', title: 'Decomposure (LEVI)', artist: 'Jai Jai', album: 'Levi', duration: '2:45', price: 1, plays: 45000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Decomposure__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-02', title: 'Hero', artist: 'Jai Jai', album: 'Levi', duration: '4:01', price: 1, plays: 67000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Hero__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-03', title: 'Keep It Real', artist: 'Jai Jai', album: 'Levi', duration: '3:22', price: 1, plays: 52000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Keep_It_Real__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-04', title: 'Lifestyle', artist: 'Jai Jai', album: 'Levi', duration: '3:45', price: 1, plays: 58000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Lifestyle__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-05', title: 'Lust', artist: 'Jai Jai', album: 'Levi', duration: '2:58', price: 1, plays: 41000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Lust__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-06', title: 'No Limits', artist: 'Jai Jai', album: 'Levi', duration: '4:12', price: 1, plays: 63000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_No_Limits__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-07', title: 'Only Real Niggaz', artist: 'Jai Jai', album: 'Levi', duration: '3:55', price: 1, plays: 47000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Only_Real_Niggaz__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-08', title: 'Pain', artist: 'Jai Jai', album: 'Levi', duration: '3:28', price: 1, plays: 39000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Pain__LEVI_501_Vol.1_.mp3') },
  { id: 'lev-09', title: 'Struggle', artist: 'Jai Jai', album: 'Levi', duration: '4:45', price: 1, plays: 55000, image: '/album-art/Levi.jpg', audio_url: audio('Levi', 'Jai_Jai_-_Struggle__LEVI_501_Vol.1_.mp3') },

  // SINGLES
  { id: 'sg-01', title: 'Amen', artist: 'O D Porter', album: 'Singles', duration: '3:42', price: 1, plays: 125000, image: '/album-art/GodIsGood.jpg' },
  { id: 'sg-02', title: "C'est La Vie", artist: 'O D Porter', album: 'Singles', duration: '4:15', price: 1, plays: 89000, image: '/album-art/GodIsGood.jpg' },
  { id: 'sg-03', title: 'Breathe', artist: 'O D Porter', album: 'Singles', duration: '3:30', price: 1, plays: 156000, image: '/album-art/FromFeastToFamine.jpg' },
];

// Album data
export const ALBUMS = {
  ambiguous: { id: 'ambiguous', name: 'Ambiguous', artist: 'O D Porter', year: 2024, image: '/album-art/Ambiguous.jpg', tracks: 21 },
  fromFeastToFamine: { id: 'from-feast-to-famine', name: 'From Feast to Famine', artist: 'O D Porter', year: 2023, image: '/album-art/FromFeastToFamine.jpg', tracks: 15 },
  godIsGood: { id: 'god-is-good', name: 'God Is Good', artist: 'O D Porter', year: 2023, image: '/album-art/GodIsGood.jpg', tracks: 9 },
  oneDay: { id: 'one-day', name: 'One Day', artist: 'O D Porter', year: 2024, image: '/album-art/OneDay.jpg', tracks: 19 },
  streetsThoughtILeft: { id: 'streets-thought-i-left', name: 'Streets Thought I Left', artist: 'Jai Jai', year: 2023, image: '/album-art/StreetsThoughtILeft.jpg', tracks: 9 },
  roxannity: { id: 'roxannity', name: 'Roxannity', artist: 'O D Porter', year: 2024, image: '/album-art/Roxannity.jpg', tracks: 30 },
  artgasm: { id: 'artgasm', name: 'Artgasm', artist: 'O D Porter', year: 2024, image: '/album-art/Artgasm.jpg', tracks: 2 },
  levi: { id: 'levi', name: 'Levi', artist: 'Jai Jai', year: 2024, image: '/album-art/Levi.jpg', tracks: 9 },
};

export { TRACKS, audio };