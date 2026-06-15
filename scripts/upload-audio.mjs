import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const MUSIC_DIR = '/Users/odjonathan/Music/Music/Media.localized/Music/O D Music';

// Album folders and their names in the database
const albums = [
  { folder: 'Ambiguous', name: 'Ambiguous' },
  { folder: 'Roxannity', name: 'Roxannity' },
  { folder: 'One Day', name: 'One Day' },
  { folder: 'From Feast to Famine', name: 'From Feast to Famine' },
  { folder: 'God Is Good', name: 'God Is Good' },
  { folder: 'Streets Thought I Left', name: 'Streets Thought I Left' },
  { folder: 'Levi', name: 'Levi' },
  { folder: 'Artgasm', name: 'Artgasm' },
];

async function uploadAudio() {
  console.log('🎵 Uploading audio files to Supabase...\n');
  
  // Get artist ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'iamodmusic@gmail.com')
    .single();
  
  if (!profile) {
    console.log('❌ Artist profile not found');
    return;
  }
  
  console.log('✅ Artist:', profile.id, '\n');
  
  let totalUploaded = 0;
  
  for (const album of albums) {
    console.log(`\n📀 ${album.name}`);
    
    // Get tracks for this album from database
    const { data: tracks, error } = await supabase
      .from('tracks')
      .select('id, title')
      .eq('album', album.name)
      .is('audio_url', null);
    
    if (error || !tracks?.length) {
      console.log(`  ⚠️  No tracks found or error: ${error?.message || 'none'}`);
      continue;
    }
    
    console.log(`  Found ${tracks.length} tracks without audio`);
    
    // Find MP3 files in album folder
    const albumPath = `${MUSIC_DIR}/${album.folder}`;
    
    for (const track of tracks) {
      // Try to find matching MP3 file
      const mp3Files = [];
      const { execSync } = await import('child_process');
      
      try {
        const files = execSync(`ls "${albumPath}"/*.mp3 2>/dev/null || ls "${albumPath}"/*.m4a 2>/dev/null`, { encoding: 'utf-8' });
        const fileList = files.trim().split('\n').filter(Boolean);
        
        // Find file matching track title
        const trackTitle = track.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchingFile = fileList.find(f => {
          const fileName = f.toLowerCase().replace(/[^a-z0-9]/g, '');
          return fileName.includes(trackTitle) || trackTitle.includes(fileName.substring(0, 20));
        });
        
        if (!matchingFile) {
          console.log(`  ❌ ${track.title}: No matching file`);
          continue;
        }
        
        // Upload to Supabase
        const fileData = readFileSync(matchingFile);
        const fileName = `audio/${profile.id}/${track.id}.mp3`;
        
        const { error: uploadError } = await supabase.storage
          .from('music')
          .upload(fileName, fileData, {
            contentType: 'audio/mpeg',
            upsert: true,
          });
        
        if (uploadError) {
          console.log(`  ❌ ${track.title}: Upload failed - ${uploadError.message}`);
          continue;
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('music')
          .getPublicUrl(fileName);
        
        // Update track
        const { error: updateError } = await supabase
          .from('tracks')
          .update({ audio_url: publicUrl })
          .eq('id', track.id);
        
        if (updateError) {
          console.log(`  ❌ ${track.title}: Update failed - ${updateError.message}`);
        } else {
          console.log(`  ✅ ${track.title}`);
          totalUploaded++;
        }
        
      } catch (e) {
        console.log(`  ❌ ${track.title}: Error - ${e.message}`);
      }
    }
  }
  
  console.log(`\n✨ Uploaded ${totalUploaded} audio files!`);
}

uploadAudio().catch(console.error);
