import { redirect } from 'next/navigation'
import { buildTapHref, getTapParams } from '@/lib/tap'

interface RegisterPageProps {
  searchParams?: Record<string, string | string[] | undefined>
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  redirect(buildTapHref('/verify', getTapParams(searchParams)))
}
