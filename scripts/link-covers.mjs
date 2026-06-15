import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Album covers (uploaded earlier)
const albumCovers = {
  'Ambiguous': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/Ambiguous.jpg',
  'Roxannity': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/Roxannity.jpg',
  'One Day': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/One_Day.jpg',
  'From Feast to Famine': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/From_Feast_to_Famine.jpg',
  'Levi': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/Levi.jpg',
  'Streets Thought I Left': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/Streets_Thought_I_Left.jpg',
  'Artgasm': 'https://tsdjmiqczgxnkpvirkya.supabase.co/storage/v1/object/public/music/album-art/Artgasm.jpg',
};

async function linkCovers() {
  console.log('🎨 Linking album covers to tracks...\n');
  
  let total = 0;
  
  for (const [album, coverUrl] of Object.entries(albumCovers)) {
    const { data, error } = await supabase
      .from('tracks')
      .update({ cover_url: coverUrl })
      .eq('album', album)
      .select('id');
    
    if (error) {
      console.log(`❌ ${album}: ${error.message}`);
    } else {
      console.log(`✅ ${album}: ${data?.length || 0} tracks updated`);
      total += data?.length || 0;
    }
  }
  
  console.log(`\n✨ Updated ${total} tracks with album covers!`);
}

linkCovers().catch(console.error);
