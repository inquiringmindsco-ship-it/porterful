import { redirect } from 'next/navigation'
import { buildTapHref, getTapParams } from '@/lib/tap'

export default async function TapInProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const { id } = await params
  redirect(buildTapHref(`/tap/${id}`, getTapParams(searchParams)))
}
