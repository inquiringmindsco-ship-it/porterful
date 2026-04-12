export const LIKENESS_REGISTRATION_URL = 'https://likenessverified.com/register'

export const ARTIST_LIVE_LIMITS = {
  tracks: 3,
  featuredTracks: 1,
  products: 3,
} as const

export interface LikenessVerificationState {
  verified: boolean
  registryId: string | null
  verifiedAt: string | null
  nameMatch: boolean
}

export function getLikenessVerificationState(profile: any): LikenessVerificationState {
  const registryId = profile?.likeness_registry_id || profile?.likeness_id || null
  const verifiedAt = profile?.likeness_verified_at || null
  const explicitVerified = profile?.likeness_verified === true
  const nameMatch = profile?.likeness_name_match !== false

  return {
    verified: Boolean(explicitVerified && registryId && verifiedAt && nameMatch),
    registryId,
    verifiedAt,
    nameMatch,
  }
}

export function getMonetizationGateMessage() {
  return 'Verify your identity to start earning'
}
