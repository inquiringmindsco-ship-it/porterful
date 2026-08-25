import { Metadata } from 'next'
import { ALL_PRODUCTS } from '@/lib/products'
import ProductClient from './ProductClient'

// Calculate compare-at price (30% markup on basePrice) for "was X now Y" display
const getCompareAtPrice = (basePrice: number) => Math.round(basePrice * 1.3 * 100) / 100

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = ALL_PRODUCTS.find(p => p.id === id)
  
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
  const compareAtPrice = product ? getCompareAtPrice(product.basePrice || 5) : 0
  const sellingPrice = product?.basePrice || 5
  
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
      price: sellingPrice.toFixed(2),
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

  // Breadcrumb structured data for better SEO
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://porterful.com' },
      { '@type': 'ListItem', position: 2, name: 'Store', item: 'https://porterful.com/marketplace' },
      { '@type': 'ListItem', position: 3, name: product?.name || 'Product', item: `https://porterful.com/product/${id}` },
    ],
  }
  
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <ProductClient productId={id} />
    </>
  )
}