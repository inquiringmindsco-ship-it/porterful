import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailPage } from '@/components/product/ProductDetailPage'
import { loadCatalogProductById } from '@/lib/product-visibility'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const product = await loadCatalogProductById(id, 'store')

  if (!product) {
    return { title: 'Product Not Found' }
  }

  const canonicalUrl = `https://porterful.com/product/${encodeURIComponent(product.id)}`
  const description = product.description || `${product.name} by ${product.artist} on Porterful.`

  return {
    title: product.name,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: product.name,
      description,
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await loadCatalogProductById(id, 'store')

  if (!product) {
    notFound()
  }

  return <ProductDetailPage product={product} />
}
