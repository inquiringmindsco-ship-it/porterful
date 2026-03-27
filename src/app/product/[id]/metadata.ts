import { Metadata } from 'next'
import { PRODUCTS } from '@/lib/data'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = PRODUCTS.find(p => p.id === id)
  
  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }
  
  return {
    title: `${product.name} by ${product.artist} | Porterful`,
    description: product.description,
    openGraph: {
      title: `${product.name} by ${product.artist}`,
      description: product.description,
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} by ${product.artist}`,
      description: product.description,
      images: [product.image],
    },
  }
}