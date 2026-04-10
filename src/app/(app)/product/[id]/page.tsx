import { redirect } from 'next/navigation'

interface ProductAliasPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductAliasPage({ params }: ProductAliasPageProps) {
  const { id } = await params
  redirect(`/product/product/${id}`)
}
