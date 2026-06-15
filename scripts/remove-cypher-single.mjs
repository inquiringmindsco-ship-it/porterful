import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicate() {
  // Remove Cypher from Singles (keep the one in Ambiguous)
  const { data, error } = await supabase
    .from('tracks')
    .delete()
    .eq('title', 'Cypher')
    .eq('album', 'Singles')
    .select('id, title');
  
  if (error) {
    console.log('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log(`✅ Removed duplicate Cypher from Singles (${data[0].id})`);
  } else {
    console.log('No Cypher in Singles found');
  }
  
  // Check remaining Cypher
  const { data: remaining } = await supabase
    .from('tracks')
    .select('id, title, album')
    .eq('title', 'Cypher');
  
  console.log('\nRemaining Cypher tracks:');
  remaining?.forEach(t => console.log(`  - ${t.title} (${t.album})`));
}

removeDuplicate();
