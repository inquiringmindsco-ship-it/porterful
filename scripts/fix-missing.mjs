import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGptaXFjemd4bmtwdmlya3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAyOTYzNiwiZXhwIjoyMDg5NjA1NjM2fQ.7PAvqsXolPTLionRlvH0caLz20KUjQGE5-e8yHzZacc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStatus() {
  console.log('=== PORTERFUL STATUS CHECK ===\n');
  
  // Count tracks
  const { count: totalTracks } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
  
  // Count tracks with audio
  const { count: tracksWithAudio } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).not('audio_url', 'is', null);
  
  // Count tracks with covers
  const { count: tracksWithCovers } = await supabase.from('tracks').select('*', { count: 'exact', head: true }).not('cover_url', 'is', null);
  
  // List albums
  const { data: albums } = await supabase.from('tracks').select('album').order('album');
  const uniqueAlbums = [...new Set(albums?.map(t => t.album).filter(Boolean))];
  
  console.log(`📊 Total Tracks: ${totalTracks}`);
  console.log(`🎵 Tracks with Audio: ${tracksWithAudio}`);
  console.log(`🖼️  Tracks with Covers: ${tracksWithCovers}`);
  console.log(`📀 Albums: ${uniqueAlbums.length}`);
  console.log('\nAlbums:', uniqueAlbums.join(', '));
  
  // Check for missing audio
  const { data: missingAudio } = await supabase.from('tracks').select('title, album').is('audio_url', null);
  
  if (missingAudio && missingAudio.length > 0) {
    console.log('\n⚠️  Tracks missing audio:');
    missingAudio.forEach(t => console.log(`   - ${t.title} (${t.album || 'Singles'})`));
  }
}

checkStatus().catch(console.error);
