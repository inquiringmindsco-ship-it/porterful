import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public/album-art');

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const albums = {
  'Ambiguous': 'Ambiguous.jpg',
  'Roxannity': 'Roxannity.jpg',
  'One Day': 'One_Day.jpg',
  'From Feast to Famine': 'From_Feast_to_Famine.jpg',
  'Levi': 'Levi.jpg',
  'Streets Thought I Left': 'Streets_Thought_I_Left.jpg',
  'Artgasm': 'Artgasm.jpg',
};

async function uploadArt() {
  console.log('🎨 Uploading album artwork to Supabase...\n');
  
  for (const [album, filename] of Object.entries(albums)) {
    const filepath = join(publicDir, filename);
    
    if (!existsSync(filepath)) {
      console.log(`❌ ${album}: File not found - ${filename}`);
      continue;
    }
    
    const fileData = readFileSync(filepath);
    const storagePath = `album-art/${filename}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('music')
      .upload(storagePath, fileData, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    
    if (uploadError) {
      console.log(`❌ ${album}: Upload failed - ${uploadError.message}`);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('music')
      .getPublicUrl(storagePath);
    
    // Update all tracks in this album
    const { error: updateError } = await supabase
      .from('tracks')
      .update({ cover_url: publicUrl })
      .eq('album', album);
    
    if (updateError) {
      console.log(`⚠️  ${album}: Uploaded but update failed - ${updateError.message}`);
    } else {
      console.log(`✅ ${album}: Artwork uploaded and linked`);
    }
  }
  
  console.log('\n✨ Done! Your tracks now have album artwork.');
}

uploadArt().catch(console.error);
