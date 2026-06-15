import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Correct track order from file names
const trackOrder = {
  'Ambiguous': [
    { num: 1, title: 'Oddysee' },
    { num: 2, title: 'Zarah' },
    { num: 3, title: 'Dopamines' },
    { num: 4, title: 'I Like All' },
    { num: 5, title: 'Danielles Dance' },
    { num: 6, title: 'Make A Move' },
    { num: 7, title: 'Pack Down' },
    { num: 8, title: 'Lust For Love' },
    { num: 9, title: 'Oxymoron' },
    { num: 10, title: 'Briauns House' },
    { num: 11, title: 'Torys Total Trip' },
    { num: 12, title: 'LeCole' },
    { num: 13, title: 'Cypher' },
    { num: 14, title: 'Bible' },
    { num: 15, title: 'Dirty World' },
    { num: 16, title: 'The Employee' },
    { num: 17, title: 'Veni Vidi Vici' },
    { num: 18, title: 'Pack Down Remix' },
    { num: 19, title: 'Lil Playa' },
    { num: 20, title: 'Nostalgism' },
    { num: 21, title: 'Enlightened' },
  ],
  'Roxannity': [
    { num: 1, title: 'Roxannity Intro' },
    { num: 2, title: 'Decomposure' },
    { num: 3, title: 'Freak Like Me' },
    { num: 4, title: 'Spoken Wordz' },
    { num: 5, title: 'Heart and Soul' },
    { num: 6, title: 'No More' },
    { num: 7, title: 'Gotta Get It' },
    { num: 8, title: 'Job' },
    { num: 9, title: 'We The Shh' },
    { num: 10, title: 'Pure Lust' },
    { num: 11, title: 'Red Pill' },
    { num: 12, title: 'Outsider' },
    { num: 13, title: 'Nightmare' },
    { num: 14, title: 'Only One In Love' },
    { num: 15, title: 'You Better Stop' },
    { num: 16, title: 'Rose' },
    { num: 17, title: 'My Testamony' },
  ],
  'One Day': [
    { num: 1, title: 'The Intro' },
    { num: 2, title: 'PushN' },
    { num: 3, title: 'Real Definition' },
    { num: 4, title: 'BandFlow' },
    { num: 5, title: 'MFCCH' },
    { num: 6, title: 'Best Wishes' },
    { num: 7, title: 'One Day' },
    { num: 8, title: 'Back At It' },
    { num: 9, title: 'Same House' },
    { num: 10, title: 'Sunshine' },
    { num: 11, title: 'Calling For Me' },
    { num: 12, title: 'GBK2' },
    { num: 13, title: 'Artgasm' },
    { num: 14, title: 'The Interlude' },
    { num: 15, title: 'Silhouette' },
    { num: 16, title: 'Street Love' },
    { num: 17, title: 'Tracey Porter' },
    { num: 18, title: 'Plus' },
    { num: 19, title: 'Mike Tyson' },
  ],
  'From Feast to Famine': [
    { num: 1, title: 'Intro' },
    { num: 2, title: 'Breathe' },
    { num: 3, title: 'Heal' },
    { num: 4, title: 'Feel This Pain' },
    { num: 5, title: 'Ride' },
    { num: 6, title: 'IJKFBO' },
    { num: 7, title: 'Trust' },
    { num: 8, title: 'Funeral' },
    { num: 9, title: 'Unchained Melodies' },
    { num: 10, title: 'Change Up' },
  ],
  'God Is Good': [
    { num: 1, title: 'God is Good Intro' },
    { num: 2, title: 'DreamWorld' },
    { num: 3, title: 'The Pain' },
    { num: 4, title: 'Amen' },
    { num: 5, title: 'Cest La Vie' },
    { num: 6, title: 'Miscommunication' },
    { num: 7, title: 'TBT' },
    { num: 8, title: 'The Untold Story' },
    { num: 9, title: 'When GOD Cry' },
  ],
  'Streets Thought I Left': [
    { num: 1, title: 'Intro To My World' },
    { num: 2, title: 'Aint Gone Let Up' },
    { num: 3, title: 'Aired Em Out' },
    { num: 4, title: 'Bounce Dat Azz' },
    { num: 5, title: 'Cutta Money' },
    { num: 6, title: 'Forever Young' },
    { num: 7, title: 'Issues' },
    { num: 8, title: 'On Errthang' },
    { num: 9, title: 'Sometime' },
  ],
  'Levi': [
    { num: 1, title: 'Decomposure' },
    { num: 2, title: 'Hero' },
    { num: 3, title: 'Keep It Real' },
    { num: 4, title: 'Lifestyle' },
    { num: 5, title: 'Lust' },
    { num: 6, title: 'No Limits' },
    { num: 7, title: 'Only Real Niggaz' },
    { num: 8, title: 'Outsider' },
    { num: 9, title: 'Spoken Word' },
  ],
  'Artgasm': [
    { num: 1, title: 'Good Bye Kisses' },
    { num: 2, title: 'Twerk-A-Thon' },
  ],
};

async function fixOrder() {
  console.log('🎵 Fixing track order...\n');
  
  let total = 0;
  
  for (const [album, tracks] of Object.entries(trackOrder)) {
    console.log(`\n📀 ${album}`);
    
    for (const track of tracks) {
      // Find track by title (fuzzy match)
      const { data: existing } = await supabase
        .from('tracks')
        .select('id, title')
        .eq('album', album)
        .ilike('title', `%${track.title.split(' ')[0]}%`)
        .limit(1);
      
      if (existing && existing[0]) {
        const { error } = await supabase
          .from('tracks')
          .update({ track_number: track.num })
          .eq('id', existing[0].id);
        
        if (error) {
          console.log(`  ❌ ${track.num}. ${track.title}: ${error.message}`);
        } else {
          console.log(`  ✅ ${track.num}. ${existing[0].title}`);
          total++;
        }
      } else {
        console.log(`  ⚠️  ${track.num}. ${track.title}: not found`);
      }
    }
  }
  
  console.log(`\n✨ Updated ${total} tracks with track numbers!`);
}

fixOrder();
