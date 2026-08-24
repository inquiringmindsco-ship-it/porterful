import { Metadata } from 'next'
import { ALL_PRODUCTS } from '@/lib/products'
import ProductClient from './ProductClient'

// Calculate sale price (30% markup on basePrice) for consistent pricing
const getSalePrice = (basePrice: number) => Math.round(basePrice * 1.3 * 100) / 100

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = ALL_PRODUCTS.find(p => p.id === id)
  const salePrice = product ? getSalePrice(product.basePrice || 5) : 0
  
  if (!product) {
    return {
      title: 'Product Not Found | Porterful',
    }
  }
  
  return {
    title: `${product.name} | Porterful`,
    description: product.description || `${product.name} - Premium quality ${product.subcategory?.toLowerCase() || 'merchandise'} on Porterful. 80% of proceeds go directly to independent artists.`,
    alternates: {
      canonical: `https://porterful.com/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | Porterful`,
      description: product.description || `Shop ${product.name}. 80% goes to independent artists.`,
      url: `https://porterful.com/product/${id}`,
      images: product.images?.[0] || product.image,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Porterful`,
      description: product.description || `Shop ${product.name}. 80% goes to independent artists.`,
      images: product.images?.[0] || product.image,
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = ALL_PRODUCTS.find(p => p.id === id)
  const salePrice = product ? getSalePrice(product.basePrice || 5) : 0
  
  // JSON-LD structured data for SEO
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - Premium quality ${product.subcategory?.toLowerCase() || 'merchandise'}. 80% of proceeds go to independent artists.`,
    image: product.images?.[0] || product.image,
    brand: {
      '@type': 'Brand',
      name: 'Porterful',
    },
    offers: {
      '@type': 'Offer',
      price: salePrice,
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