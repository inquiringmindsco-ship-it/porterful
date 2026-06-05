import { notFound } from 'next/navigation'
import { ProductDetailPage } from '@/components/product/ProductDetailPage'
import { loadCatalogProductById } from '@/lib/product-visibility'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await loadCatalogProductById(id, 'store')

  if (!product) {
    notFound()
  }

  return <ProductDetailPage product={product} />
}
