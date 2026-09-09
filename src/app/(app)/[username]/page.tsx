import { notFound, redirect } from 'next/navigation'

const RESERVED_FILE_ROUTES = new Set(['opengraph-image', 'twitter-image'])

export default async function UsernameAliasPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  if (username.includes('.') || RESERVED_FILE_ROUTES.has(username)) {
    notFound()
  }

  redirect(`/store?ref=${encodeURIComponent(username)}`)
}
