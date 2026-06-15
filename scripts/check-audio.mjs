import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAudio() {
  const { data, error } = await supabase
    .from('tracks')
    .select('id, title, album, audio_url')
    .limit(5);
  
  if (error) {
    console.log('Error:', error.message);
    return;
  }
  
  console.log('=== TRACKS WITH AUDIO ===\n');
  data.forEach(t => {
    console.log(`${t.title} (${t.album})`);
    console.log(`  audio_url: ${t.audio_url || 'NULL'}`);
    console.log('');
  });
}

checkAudio();
