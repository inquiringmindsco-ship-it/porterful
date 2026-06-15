import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getOrCreateArtist() {
  // Get the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, username')
    .eq('email', 'iamodmusic@gmail.com')
    .single();
  
  if (profileError) {
    console.log('❌ Profile not found:', profileError.message);
    return null;
  }
  
  console.log('✅ Found profile:', profile.id);
  
  // Check if artist record exists
  const { data: existingArtist } = await supabase
    .from('artists')
    .select('id')
    .eq('id', profile.id)
    .single();
  
  if (existingArtist) {
    console.log('✅ Found artist record:', existingArtist.id);
    return existingArtist.id;
  }
  
  // Create artist record with name
  console.log('Creating artist record...');
  const { data: newArtist, error: createError } = await supabase
    .from('artists')
    .insert({
      id: profile.id,
      name: profile.full_name || profile.username || 'O D Porter',
      slug: 'od-porter',
      bio: 'Independent artist from New Orleans',
      genre: ['Hip-Hop', 'R&B'],
      location: 'New Orleans, LA',
    })
    .select('id')
    .single();
  
  if (createError) {
    console.log('❌ Could not create artist:', createError.message);
    return null;
  }
  
  console.log('✅ Created artist record:', newArtist.id);
  return newArtist.id;
}

async function importMusic() {
  console.log('🎵 Importing your music catalog...\n');
  
  const artistId = await getOrCreateArtist();
  if (!artistId) return;
  
  // All your albums and tracks
  const albums = [
    { name: 'Ambiguous', tracks: ['Oddysee', 'Zarah', 'Dopamines', 'I Like All', 'Danielles Dance', 'Make A Move', 'Pack Down', 'Lust For Love', 'Oxymoron', 'Briauns House', "Torys Total Trip", 'LeCole', 'Cypher', 'Bible', 'Dirty World', 'The Employee', 'Veni Vidi Vici', 'Pack Down Remix', 'Lil Playa', 'Nostalgism', 'Enlightened'] },
    { name: 'Roxannity', tracks: ['Roxannity Intro', 'Decomposure', 'Freak Like Me', 'Spoken Wordz', 'Heart and Soul', 'No More', 'Gotta Get It', 'Job', 'We The Shh', 'Pure Lust', 'Red Pill', 'Nightmare', 'Only One In Love', 'You Better Stop', 'Rose', 'My Testamony'] },
    { name: 'One Day', tracks: ['The Intro', 'PushN', 'Real Definition', 'BandFlow', 'MFCCH', 'Best Wishes', 'One Day', 'Back At It', 'Same House', 'Sunshine', 'Calling For Me', 'GBK2', 'Artgasm', 'The Interlude', 'Silhouette', 'Street Love', 'Tracey Porter', 'Plus', 'Mike Tyson'] },
    { name: 'From Feast to Famine', tracks: ['Intro', 'Breathe', 'Heal', 'Feel This Pain', 'Ride', 'IJKFBO', 'Trust', 'Funeral', 'Unchained Melodies', 'Change Up'] },
    { name: 'God Is Good', tracks: ['God is Good Intro', 'DreamWorld', 'The Pain', 'Amen', 'Cest La Vie', 'Miscommunication', 'TBT', 'The Untold Story', 'When GOD Cry'] },
    { name: 'Streets Thought I Left', artist: 'Jai Jai', tracks: ['Intro To My World', 'Aint Gone Let Up', 'Aired Em Out', 'Bounce Dat Azz', 'Cutta Money', 'Forever Young', 'Issues', 'On Errthang', 'Sometime'] },
    { name: 'Levi', artist: 'Jai Jai', tracks: ['Decomposure', 'Hero', 'Keep It Real', 'Lifestyle', 'Lust', 'No Limits', 'Only Real Niggaz', 'Outsider', 'Spoken Word'] },
    { name: 'Every Instrumentals', tracks: ['ReIntro', 'Glimps', 'W_O', 'Inner View', 'Peace', 'A Proposito', 'Mortal Gods', 'Noble Honor', 'Painless', 'Tru Luv', '2BC'] },
    { name: 'Artgasm', tracks: ['Good Bye Kisses', 'Twerk-A-Thon'] },
  ];

  const singles = ['TLF', 'Embrace', 'After Effects', 'Too Stingy', 'Where I Wanna Be', 'Cypher'];

  let totalImported = 0;

  for (const album of albums) {
    console.log(`\n📀 ${album.name} (${album.tracks.length} tracks)`);
    
    for (let i = 0; i < album.tracks.length; i++) {
      const track = album.tracks[i];
      
      const { error } = await supabase.from('tracks').insert({
        artist_id: artistId,
        title: track,
        artist: album.artist || 'O D Porter',
        album: album.name,
        duration: 180 + Math.floor(Math.random() * 120),
      });
      
      if (error) {
        if (!error.message.includes('duplicate') && !error.message.includes('already exists')) {
          console.log(`  ❌ ${track}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${i + 1}. ${track}`);
        totalImported++;
      }
    }
  }

  console.log('\n🎵 Singles:');
  for (const title of singles) {
    const { error } = await supabase.from('tracks').insert({
      artist_id: artistId,
      title: title,
      artist: 'O D Porter',
      album: 'Singles',
      duration: 180 + Math.floor(Math.random() * 120),
    });
    
    if (error) {
      if (!error.message.includes('duplicate') && !error.message.includes('already exists')) {
        console.log(`  ❌ ${title}: ${error.message}`);
      }
    } else {
      console.log(`  ✅ ${title}`);
      totalImported++;
    }
  }

  console.log(`\n✨ Imported ${totalImported} tracks!`);
  console.log('\n🎧 Visit http://localhost:3000/radio to see your music!');
}

importMusic().catch(console.error);
