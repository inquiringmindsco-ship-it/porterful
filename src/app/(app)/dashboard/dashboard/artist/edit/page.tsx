'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Upload, Save, ArrowLeft, X, Camera, Image as ImageIcon, 
  Music, Globe, Youtube, Twitter, Instagram, Check, AlertCircle
} from 'lucide-react'

export default function EditArtistPage() {
  const router = useRouter()
  const { user, supabase, loading: authLoading } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [genre, setGenre] = useState('')
  const [location, setLocation] = useState('')
  const [website, setWebsite] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadProfile() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }

      try {
        const res = await fetch(`/api/artists/${user.id}`)
        const data = await res.json()
        
        if (data.profile) {
          setName(data.profile.full_name || data.profile.name || '')
          setBio(data.profile.bio || '')
          setGenre(data.profile.genre || '')
          setLocation(data.profile.location || '')
          setWebsite(data.profile.website || '')
          setYoutubeUrl(data.profile.youtube_url || '')
          setInstagramUrl(data.profile.instagram_url || '')
          setTwitterUrl(data.profile.twitter_url || '')
          setAvatarUrl(data.profile.avatar_url || '')
          setCoverUrl(data.profile.cover_url || '')
          if (data.profile.avatar_url) setAvatarPreview(data.profile.avatar_url)
          if (data.profile.cover_url) setCoverPreview(data.profile.cover_url)
        } else {
          // Try fetching via supabase directly for the name at minimum
          const { data: profile } = await supabase!
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          if (profile) {
            setName(profile.full_name || profile.name || '')
            setAvatarUrl(profile.avatar_url || '')
            if (profile.avatar_url) setAvatarPreview(profile.avatar_url)
            setCoverUrl(profile.cover_url || '')
            if (profile.cover_url) setCoverPreview(profile.cover_url)
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [user, supabase, authLoading, router])

  // Image upload handler
  const uploadImage = async (file: File, type: 'avatar' | 'cover'): Promise<string | null> => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', type === 'avatar' ? 'artist-images' : 'artist-images')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed')
      }
      return data.url
    } catch (err: any) {
      console.error('Image upload error:', err)
      throw err
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file)
    setAvatarPreview(localUrl)

    try {
      const url = await uploadImage(file, 'avatar')
      if (url) {
        setAvatarUrl(url)
        setAvatarPreview(url)
      }
    } catch (err: any) {
      setError(`Avatar upload failed: ${err.message}`)
      setAvatarPreview(avatarUrl) // Revert to current
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const localUrl = URL.createObjectURL(file)
    setCoverPreview(localUrl)

    try {
      const url = await uploadImage(file, 'cover')
      if (url) {
        setCoverUrl(url)
        setCoverPreview(url)
      }
    } catch (err: any) {
      setError(`Cover upload failed: ${err.message}`)
      setCoverPreview(coverUrl)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/artists/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          bio,
          genre,
          location,
          website,
          youtube_url: youtubeUrl,
          instagram_url: instagramUrl,
          twitter_url: twitterUrl,
          avatar_url: avatarUrl,
          cover_url: coverUrl,
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-48 bg-[var(--pf-surface)] rounded" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/artist" className="p-2 hover:bg-[var(--pf-surface)] rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Edit Artist Profile</h1>
              <p className="text-[var(--pf-text-secondary)]">Update your public artist profile</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-2 text-green-400">
            <Check size={18} />
            Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <div 
              className="relative w-full h-40 max-h-40 rounded-xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] cursor-pointer group shrink-0"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover" fill sizes="(max-width: 768px) 100vw, 720px" className="object-cover w-full h-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="mx-auto mb-2 text-[var(--pf-text-muted)]" size={32} />
                    <p className="text-sm text-[var(--pf-text-muted)]">Click to upload cover image</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">Recommended: 1500×500px</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload size={24} />
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* Avatar Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div 
                className="relative w-24 h-24 max-w-24 max-h-24 rounded-xl overflow-hidden bg-[var(--pf-surface)] border border-[var(--pf-border)] cursor-pointer group shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="Avatar" fill sizes="96px" className="object-cover w-full h-full" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="text-[var(--pf-text-muted)]" size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Profile Photo</p>
                <p className="text-xs text-[var(--pf-text-muted)]">Recommended: 400×400px, max 5MB</p>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 text-sm text-[var(--pf-orange)] hover:underline"
                >
                  Upload new photo
                </button>
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Basic Info */}
          <div className="pf-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Basic Info</h2>

            <div>
              <label className="block text-sm font-medium mb-2">Artist / Stage Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pf-input"
                placeholder="Your artist name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="pf-input min-h-[120px]"
                placeholder="Tell fans who you are..."
                maxLength={500}
              />
              <p className="text-xs text-[var(--pf-text-muted)] mt-1">{bio.length}/500</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <input
                  type="text"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="pf-input"
                  placeholder="e.g., Hip-Hop, R&B"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pf-input"
                  placeholder="e.g., St. Louis, MO"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={16} />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="pf-input pl-10"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="pf-card p-6 space-y-4">
            <h2 className="font-semibold text-lg">Social Links</h2>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Youtube size={14} className="inline mr-1 text-red-500" /> YouTube
              </label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="pf-input"
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Instagram size={14} className="inline mr-1 text-pink-400" /> Instagram
              </label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="pf-input"
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Twitter size={14} className="inline mr-1 text-blue-400" /> X (Twitter)
              </label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="pf-input"
                placeholder="https://x.com/yourusername"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Link href="/dashboard/artist" className="pf-btn pf-btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="pf-btn pf-btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
