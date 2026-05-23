import { fetchHomepageData } from '@/lib/homepage-data'
import { HomePageClient } from '@/components/homepage/HomePageClient'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const data = await fetchHomepageData()
  return <HomePageClient serverData={data} />
}
