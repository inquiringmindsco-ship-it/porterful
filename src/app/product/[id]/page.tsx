import { Metadata } from 'next'
import { ALL_PRODUCTS } from '@/lib/products'
import ProductClient from './ProductClient'

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
      images: [{ url: product.images?.[0] || product.image, width: 800, height: 800 }],
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
  // API computes: salePrice = basePrice * 1.3; compareAtPrice = salePrice * 1.3
  const basePrice = product?.basePrice || 5
  const sellingPrice = Math.round(basePrice * 1.3 * 100) / 100
  const compareAtPrice = Math.round(sellingPrice * 1.3 * 100) / 100
  
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
  // Note: /shop redirects to /store in production - using /store as canonical for Shop crumb
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://porterful.com' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://porterful.com/store' },
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
