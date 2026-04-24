'use client'

import Link from 'next/link'
import { Music, MapPin, Clock, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { LikenessVerifiedBadge } from '@/components/LikenessVerifiedBadge'

// Extended artist type with database fields
interface ArtistProfile {
  id: string
  username: string | null
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio?: string
  genre?: string
  location?: string
  verified?: boolean
  // likeness_verified: DB-backed boolean — only true when DB columns exist AND profile has it set
  likeness_verified?: boolean
  // data_source: 'db' = from Supabase, 'static' = from PLATFORM_ARTISTS fallback
  data_source?: 'db' | 'static'
  tracks?: number
  status?: string
  youtube_url?: string
  instagram_url?: string
  twitter_url?: string
}

// STATIC FALLBACK DATA — transitional only, NOT the durable truth source.
// These exist to provide artist content when DB queries fail.
// IMPORTANT: likeness_verified here is NOT DB-backed verification.
// When DB columns exist, O D Porter's profile must be updated in Supabase directly.
// Static likeness_verified flags are placeholders until real DB records exist.
const PLATFORM_ARTISTS: ArtistProfile[] = [
  {
    id: 'od-porter',
    username: 'odporter',
    full_name: 'O D Porter',
    email: 'iamodmusic@gmail.com',
    avatar_url: '/artist-images/od-porter/od-porter.jpg',
    bio: 'Artist. Architect of Porterful. Born Miami, raised New Orleans & St. Louis.',
    genre: 'Hip-Hop / R&B / Soul',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: true,
    data_source: 'static',
    tracks: 21,
    status: 'live',
    youtube_url: 'https://youtube.com/@odporter',
    instagram_url: 'https://instagram.com/odporter',
    twitter_url: 'https://twitter.com/odporter',
  },
  {
    id: 'gune',
    username: 'gune',
    full_name: 'Gune',
    email: null,
    avatar_url: '/artist-images/gune/ISIMG-1050533.JPG',
    bio: 'St. Louis rapper with a raw sound.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false,
    data_source: 'static',
    tracks: 3,
    status: 'live',
  },
  // Jay Jay catalog (OD's former artist name)
  {
    id: 'jay-jay',
    username: 'jay-jay',
    full_name: 'Jay Jay',
    email: null,
    avatar_url: '/artist-images/jay-jay/avatar.jpg',
    bio: 'Jay Jay — O D Porter's catalog under a former name.',
    genre: 'Hip-Hop / R&B',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false,
    data_source: 'static',
    tracks: 19, // Levi (9) + Streets Thought I Left (10)
    status: 'live',
  },
  // ATM Trap has real music
  {
    id: 'atm-trap',
    username: 'atm-trap',
    full_name: 'ATM Trap',
    email: null,
    avatar_url: '/artist-images/atm-trap/images/avatar.jpg',
    bio: 'St. Louis hip-hop.',
    genre: 'Hip-Hop',
    location: 'St. Louis, MO',
    verified: true,
    likeness_verified: false,
    data_source: 'static',
    tracks: 5,
    status: 'live',
  },
