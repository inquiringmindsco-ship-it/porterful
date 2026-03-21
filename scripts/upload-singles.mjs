import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZGptaXFjemd4bmtwdmlya3lhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAyOTYzNiwiZXhwIjoyMDg5NjA1NjM2fQ.7PAvqsXolPTLionRlvH0caLz20KUjQGE5-e8yHzZacc';

const supabase = createClient(supabaseUrl, supabaseKey);

const MUSIC_DIR = '/Users/odjonathan/Music/Music/Media.localized/Music';

const singles = [
  { title: 'TLF', path: 'O D Porter/TLF (single)/01 TLF.mp3', album: 'Singles' },
  { title: 'Embrace', path: 'O D Porter/Embrace (Single)/Embrace.mp3', album: 'Singles' },
  { title: 'After Effects', path: 'O D Porter/After Effects/After Effects.mp3', album: 'Singles' },
];

const roxannityMissing = [
  { title: 'Heart & Soul', path: 'O D Music/Roxannity/05 Heart & Soul.mp3' },
  { title: 'We The Shh', search: 'We The Sh' },
  { title: 'Only One In Love', path: 'O D Music/Roxannity/13 Only One In Love.mp3' },
  { title: 'Nightmare', search: 'Nightmare' },
];

async function uploadSingles() {
  console.log('🎵 Uploading missing singles...\n');
  
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', 'iamodmusic@gmail.com').single();
  if (!profile) return;
  
  for (const single of singles) {
    const fullPath = `${MUSIC_DIR}/${single.path}`;
    
    try {
      const fileData = readFileSync(fullPath);
      
      // Find track
      const { data: track } = await supabase.from('tracks').select('id').eq('title', single.title).single();
      
      if (!track) {
        console.log(`❌ ${single.title}: Track not found in database`);
        continue;
      }
      
      // Upload
      const fileName = `audio/${profile.id}/${track.id}.mp3`;
      const { error: uploadError } = await supabase.storage.from('music').upload(fileName, fileData, { contentType: 'audio/mpeg', upsert: true });
      
      if (uploadError) {
        console.log(`❌ ${single.title}: Upload failed - ${uploadError.message}`);
        continue;
      }
      
      // Get URL and update
      const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('tracks').update({ audio_url: publicUrl }).eq('id', track.id);
      
      if (updateError) {
        console.log(`❌ ${single.title}: Update failed - ${updateError.message}`);
      } else {
        console.log(`✅ ${single.title}`);
      }
    } catch (e) {
      console.log(`❌ ${single.title}: ${e.message}`);
    }
  }
  
  // Roxannity missing tracks
  console.log('\n🎵 Uploading missing Roxannity tracks...\n');
  
  for (const track of roxannityMissing) {
    try {
      let filePath = track.path ? `${MUSIC_DIR}/${track.path}` : null;
      
      if (!filePath && track.search) {
        // Search for file
        const result = execSync(`find "${MUSIC_DIR}/O D Music/Roxannity" -name "*${track.search}*" -type f 2>/dev/null | head -1`, { encoding: 'utf-8' });
        filePath = result.trim();
      }
      
      if (!filePath) {
        console.log(`❌ ${track.title}: File not found`);
        continue;
      }
      
      const fileData = readFileSync(filePath);
      
      // Find track
      const { data: dbTrack } = await supabase.from('tracks').select('id').eq('title', track.title).single();
      
      if (!dbTrack) {
        console.log(`❌ ${track.title}: Track not found in database`);
        continue;
      }
      
      // Upload
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

uploadSingles();
