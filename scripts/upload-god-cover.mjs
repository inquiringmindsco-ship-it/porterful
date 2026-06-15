import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const supabaseUrl = 'https://tsdjmiqczgxnkpvirkya.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadCover() {
  console.log('🎨 Uploading God is Good cover...\n');
  
  const filePath = '/Users/odjonathan/Documents/Porterful/porterful-app/public/album-art/God_Is_Good.jpg';
  const fileData = readFileSync(filePath);
  
  // Upload to Supabase
  const { error: uploadError } = await supabase.storage
    .from('music')
    .upload('album-art/God_Is_Good.jpg', fileData, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  
  if (uploadError) {
    console.log('Upload error:', uploadError.message);
    return;
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('music')
    .getPublicUrl('album-art/God_Is_Good.jpg');
  
  console.log('✅ Uploaded to:', publicUrl);
  
  // Update all God is Good tracks
  const { error: updateError } = await supabase
    .from('tracks')
    .update({ cover_url: publicUrl })
    .eq('album', 'God Is Good');
  
  if (updateError) {
    console.log('Update error:', updateError.message);
  } else {
    console.log('✅ Updated God is Good tracks with cover art');
  }
}

uploadCover();
