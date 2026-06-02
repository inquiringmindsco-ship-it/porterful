import { redirect } from 'next/navigation'

export default function ArtistEditAliasPage() {
  redirect('/dashboard/artist/edit')
}

// Note: The canonical edit page is at /dashboard/artist/edit
// This redirect preserves legacy links while the canonical route is cleaned up
