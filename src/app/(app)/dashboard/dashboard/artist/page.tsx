import { redirect } from 'next/navigation'

// Legacy redirect: this route exists for backwards compatibility
// The canonical route is /dashboard/artist
// Users hitting this URL will be redirected to the canonical path

export default function DashboardDashboardArtistRedirectPage() {
  redirect('/dashboard/artist')
}
