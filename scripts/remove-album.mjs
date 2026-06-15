import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeAlbum() {
  console.log('🗑️  Removing "Every Instrumentals"...\n');
  
  const { data, error } = await supabase
    .from('tracks')
    .delete()
    .eq('album', 'Every Instrumentals')
    .select('title');
  
  if (error) {
    console.log('❌ Error:', error.message);
  } else if (data) {
    console.log(`✅ Removed ${data.length} tracks from Every Instrumentals`);
    data.forEach(t => console.log(`   - ${t.title}`));
  }
}

removeAlbum().catch(console.error);
