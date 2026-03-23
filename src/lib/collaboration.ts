// Collaboration Types
export interface Collaborator {
  id: string
  name: string
  email?: string
  role: 'primary' | 'featured' | 'producer' | 'writer' | 'engineer'
  split: number // percentage (0-100)
  wallet_address?: string
  stripe_account_id?: string
  status: 'pending' | 'active' | 'removed'
}

export interface TrackCollaboration {
  track_id: string
  collaborators: Collaborator[]
  total_split: number // should equal 100
  created_at: string
  updated_at: string
}

// Revenue split calculation
export function calculateSplit(amount: number, splits: Collaborator[]): { id: string; amount: number }[] {
  return splits
    .filter(c => c.status === 'active')
    .map(c => ({
      id: c.id,
      amount: Math.round(amount * (c.split / 100) * 100) / 100
    }))
}

// Default collaboration splits
export const DEFAULT_COLLABORATION = {
  primary_artist: 67, // Artist gets 67%
  platform: 10,       // Porterful takes 10%
  featured_artist: 0, // To be split with collaborators
  superfan: 3,        // Superfan referrer gets 3%
  artist_fund: 20     // Artist fund gets 20%
}

// Role labels for UI
export const ROLE_LABELS: Record<Collaborator['role'], string> = {
  primary: 'Primary Artist',
  featured: 'Featured Artist',
  producer: 'Producer',
  writer: 'Songwriter',
  engineer: 'Engineer'
}

// Example collaborations for demo
export const EXAMPLE_COLLABORATIONS: TrackCollaboration[] = [
  {
    track_id: 'amb-06',
    collaborators: [
      { id: 'od-porter', name: 'O D Porter', role: 'primary', split: 60, status: 'active' },
      { id: 'featured-1', name: 'Guest Artist', role: 'featured', split: 20, status: 'active' },
      { id: 'prod-1', name: 'Producer Name', role: 'producer', split: 10, status: 'active' }
    ],
    total_split: 90, // Platform takes 10%
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  }
]