import { Metadata } from 'next'
import { PRODUCTS } from '@/lib/data'
import ProductClient from './ProductClient'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = PRODUCTS.find(p => p.id === id)
  
  if (!product) {
    return {
      title: 'Product Not Found | Porterful',
    }
  }
  
  return {
    title: `${product.name} by ${product.artist} | Porterful`,
    description: product.description || `Stream and buy ${product.name} by ${product.artist} on Porterful. 80% goes directly to the artist.`,
    openGraph: {
      title: `${product.name} by ${product.artist}`,
      description: product.description || `Stream and buy ${product.name} by ${product.artist} on Porterful. 80% goes directly to the artist.`,
      images: [product.image],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} by ${product.artist}`,
      description: product.description || `Stream and buy ${product.name} by ${product.artist} on Porterful. 80% goes directly to the artist.`,
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = PRODUCTS.find(p => p.id === id)
  
  // JSON-LD structured data for SEO
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Official ${product.name} merchandise by ${product.artist} on Porterful. Premium quality. 80% goes to the artist.`,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.artist,
    },
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: 'USD',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    } : undefined,
  } : null
  
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductClient productId={id} />
    </>
  )
}