import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGptaXFjemd4bmtwdmlya3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAyOTYzNiwiZXhwIjoyMDg5NjA1NjM2fQ.7PAvqsXolPTLionRlvH0caLz20KUjQGE5-e8yHzZacc';

const supabase = createClient(supabaseUrl, supabaseKey);

const MUSIC_DIR = '/Users/odjonathan/Music/Music/Media.localized/Music';

const finalTracks = [
  { title: 'Too Stingy', path: 'O D Jonathan Porter/Too Stingy (Single)/01 Too Stingy.mp3', album: 'Singles' },
  { title: 'Cypher', path: 'O D Music/Ambiguous/13 Cypher.mp3', album: 'Ambiguous' },
  { title: 'Where I Wanna Be', path: 'O D Porter/O D Porter\'s Album/Where I Wanna Be.mp3', album: 'Singles' },
  { title: 'Only One In Love', path: 'O D Music/Roxannity/13 Only One In Love.m4a', album: 'Roxannity' },
];

async function uploadFinal() {
  console.log('🎵 Uploading final missing tracks...\n');
  
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', 'iamodmusic@gmail.com').single();
  if (!profile) return;
  
  for (const track of finalTracks) {
    const fullPath = `${MUSIC_DIR}/${track.path}`;
    
    try {
      const fileData = readFileSync(fullPath);
      const { data: dbTrack } = await supabase.from('tracks').select('id').eq('title', track.title).single();
      
      if (!dbTrack) {
        console.log(`❌ ${track.title}: Not in database`);
        continue;
      }
      
      const fileName = `audio/${profile.id}/${dbTrack.id}.mp3`;
      const { error: uploadError } = await supabase.storage.from('music').upload(fileName, fileData, { contentType: 'audio/mpeg', upsert: true });
      
      if (uploadError) {
        console.log(`❌ ${track.title}: Upload failed`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(fileName);
      await supabase.from('tracks').update({ audio_url: publicUrl }).eq('id', dbTrack.id);
      
      console.log(`✅ ${track.title}`);
    } catch (e) {
      console.log(`❌ ${track.title}: ${e.message}`);
    }
  }
  
  console.log('\n✨ Done!');
}

uploadFinal();
