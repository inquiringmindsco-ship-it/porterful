import { redirect } from 'next/navigation'
import { buildTapHref, getTapParams } from '@/lib/tap'

export default function TapInPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  redirect(buildTapHref('/tap', getTapParams(searchParams)))
}
