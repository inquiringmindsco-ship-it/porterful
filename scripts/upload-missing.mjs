import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const MUSIC_DIR = '/Users/odjonathan/Music/Music/Media.localized/Music';

const missingTracks = [
  { title: 'Heart & Soul', dbTitle: 'Heart and Soul', path: 'O D Music/Roxannity/05 Heart & Soul.mp3', album: 'Roxannity' },
  { title: 'Miscommunication', dbTitle: 'Miscommunication', path: 'Unknown Artist/Unknown Album/Miscommunication.mp3', album: 'God Is Good' },
];

async function uploadMissing() {
  console.log('🎵 Uploading remaining missing tracks...\n');
  
  const { data: profile } = await supabase.from('profiles').select('id').eq('email', 'iamodmusic@gmail.com').single();
  if (!profile) return;
  
  for (const track of missingTracks) {
    const fullPath = `${MUSIC_DIR}/${track.path}`;
    
    try {
      console.log(`Uploading: ${track.title}`);
      const fileData = readFileSync(fullPath);
      
      // Find track by approximate title match
      const { data: tracks } = await supabase
        .from('tracks')
        .select('id, title')
        .ilike('title', `%${track.title.split(' ')[0]}%`)
        .eq('album', track.album);
      
      const dbTrack = tracks?.[0];
      
      if (!dbTrack) {
        console.log(`  ❌ Not found in database: ${track.title}`);
        continue;
      }
      
      console.log(`  Found: ${dbTrack.title} (${dbTrack.id})`);
      
      // Upload
      const fileName = `audio/${profile.id}/${dbTrack.id}.mp3`;
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, fileData, { contentType: 'audio/mpeg', upsert: true });
      
      if (uploadError) {
        console.log(`  ❌ Upload failed: ${uploadError.message}`);
        continue;
      }
      
      // Get URL and update
      const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(fileName);
      const { error: updateError } = await supabase
        .from('tracks')
        .update({ audio_url: publicUrl })
        .eq('id', dbTrack.id);
      
      if (updateError) {
        console.log(`  ❌ Update failed: ${updateError.message}`);
      } else {
        console.log(`  ✅ Uploaded successfully!`);
      }
      
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }
  
  console.log('\n✨ Done!');
}

uploadMissing();
