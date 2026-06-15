import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeTrack() {
  const { data, error } = await supabase
    .from('tracks')
    .delete()
    .eq('title', 'Where I Wanna Be')
    .select('id, title');
  
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log(`✅ Removed: ${data[0].title}`);
  } else {
    console.log('Track not found');
  }
}

removeTrack();
