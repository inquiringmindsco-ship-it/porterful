import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGptaXFjemd4bmtwdmlya3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAyOTYzNiwiZXhwIjoyMDg5NjA1NjM2fQ.7PAvqsXolPTLionRlvH0caLz20KUjQGE5-e8yHzZacc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCypher() {
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', 'iamodmusic@gmail.com').single();
  if (!profile) return;
  
  // Check if Cypher already exists
  const { data: existing } = await supabase.from('tracks').select('id').eq('title', 'Cypher').eq('album', 'Ambiguous').single();
  
  if (existing) {
    console.log('Cypher already exists in database');
    return;
  }
  
  // Add Cypher to Ambiguous album
  const { error } = await supabase.from('tracks').insert({
    artist_id: profile.id,
    title: 'Cypher',
    artist: 'O D Porter',
    album: 'Ambiguous',
    duration: 240,
    play_count: 5000,
    proud_to_pay_min: 5,
  });
  
  if (error) {
    console.log('Error adding Cypher:', error.message);
  } else {
    console.log('✅ Added Cypher to Ambiguous album');
  }
}

addCypher();
