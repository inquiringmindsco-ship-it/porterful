'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { Upload, Music, Loader2, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
  const { user } = useSupabase();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const audioFiles = selectedFiles.filter(f => 
        f.type.startsWith('audio/') || 
        f.name.endsWith('.mp3') || 
        f.name.endsWith('.m4a') ||
        f.name.endsWith('.wav')
      );
      setFiles(prev => [...prev, ...audioFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!user || files.length === 0) return;
    
    setUploading(true);
    setErrors([]);
    setUploaded([]);

    for (const file of files) {
      try {
        // Get Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase not configured');
        }

        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const formData = new FormData();
        formData.append('file', file);
        
        // Use Supabase client for upload
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase.storage
          .from('audio')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);

        setUploaded(prev => [...prev, `${file.name} → ${urlData.publicUrl}`]);
        setProgress(prev => ({ ...prev, [file.name]: 100 }));
        
      } catch (err: any) {
        console.error('Upload error:', err);
        setErrors(prev => [...prev, `${file.name}: ${err.message}`]);
      }
    }

    setUploading(false);
    setFiles([]);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-2xl">
          <div className="pf-card p-12 text-center">
            <Music size={48} className="mx-auto mb-4 text-[var(--pf-orange)]" />
            <h1 className="text-2xl font-bold mb-4">Upload Your Music</h1>
            <p className="text-[var(--pf-text-secondary)] mb-6">
              Sign in to upload your tracks and start earning.
            </p>
            <Link href="/login" className="pf-btn pf-btn-primary">
              Sign In to Upload
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Music</h1>
          <p className="text-[var(--pf-text-secondary)]">
            Upload your tracks to Porterful. Supported formats: MP3, M4A, WAV (max 50MB)
          </p>
        </div>

        {/* Upload Area */}
        <div className="pf-card p-8 mb-6">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-[var(--pf-border)] rounded-xl p-12 text-center hover:border-[var(--pf-orange)] transition-colors">
              <Upload size={48} className="mx-auto mb-4 text-[var(--pf-text-muted)]" />
              <p className="text-xl font-medium mb-2">Drop your audio files here</p>
              <p className="text-[var(--pf-text-muted)] mb-4">or click to browse</p>
              <input
                type="file"
                multiple
                accept="audio/*,.mp3,.m4a,.wav"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="pf-btn pf-btn-secondary">
                Select Files
              </span>
            </div>
          </label>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="pf-card p-6 mb-6">
            <h2 className="font-bold mb-4">Files to Upload ({files.length})</h2>
            <div className="space-y-3">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[var(--pf-surface)] rounded-lg">
                  <Music size={20} className="text-[var(--pf-orange)]" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-[var(--pf-text-muted)]">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="p-2 hover:bg-[var(--pf-bg)] rounded text-red-400"
                    disabled={uploading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={uploadFiles}
                disabled={uploading || files.length === 0}
                className="pf-btn pf-btn-primary flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="inline mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="inline mr-2" />
                    Upload {files.length} file{files.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="pf-btn pf-btn-secondary"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Uploaded Results */}
        {uploaded.length > 0 && (
          <div className="pf-card p-6 mb-6 border-green-500/50">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <Check size={20} className="text-green-500" />
              Uploaded Successfully ({uploaded.length})
            </h2>
            <div className="space-y-2">
              {uploaded.map((url, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="text-green-500" />
                  <span className="truncate">{url}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Errors */}
        {errors.length > 0 && (
          <div className="pf-card p-6 mb-6 border-red-500/50">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-red-500" />
              Upload Errors
            </h2>
            <div className="space-y-2">
              {errors.map((err, i) => (
                <div key={i} className="text-sm text-red-400">{err}</div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="pf-card p-6 bg-[var(--pf-orange)]/5 border-[var(--pf-orange)]/20">
          <h3 className="font-bold mb-2">Upload Guidelines</h3>
          <ul className="text-sm text-[var(--pf-text-secondary)] space-y-1">
            <li>• Maximum file size: 50MB per track</li>
            <li>• Supported formats: MP3, M4A, WAV</li>
            <li>• You keep 80% of every sale</li>
            <li>• Set your price after upload</li>
            <li>• Add album art and metadata in the next step</li>
          </ul>
        </div>
      </div>
    </div>
  );
}