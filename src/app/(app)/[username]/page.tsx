import { redirect } from 'next/navigation'

export default async function UsernameAliasPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  redirect(`/store?ref=${encodeURIComponent(username)}`)
}
