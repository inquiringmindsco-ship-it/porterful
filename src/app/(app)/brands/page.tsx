import Link from 'next/link'
import Image from 'next/image'
import { PUBLIC_BRANDS, getBrandProducts, type Brand, type Product } from '@/lib/products'
import { isPurchasable } from '@/lib/products'
import { loadCatalogProducts } from '@/lib/product-visibility'
import { Star, ArrowRight } from 'lucide-react'

export default async function BrandsPage() {
  const catalogProducts = await loadCatalogProducts('store')

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        {/* Header */}
        <div data-contrast-surface className="mb-10 rounded-[32px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.1)] sm:p-12">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-[var(--pf-accent-text)]" />
            <span data-contrast-text className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pf-accent-text)]">
              Featured Brands
            </span>
          </div>
          <h1 data-contrast-text className="mb-4 text-4xl font-semibold tracking-[-0.04em] text-[var(--pf-text)] sm:text-5xl">
            Brands with a point of view.
          </h1>
          <p className="text-lg text-[var(--pf-text-secondary)] max-w-2xl">
            Independent brands building carefully and selling directly. Porterful only displays brands with an active public collection.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_BRANDS.map(brand => (
            <BrandCard key={brand.id} brand={brand} catalogProducts={catalogProducts} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandCard({ brand, catalogProducts }: { brand: Brand; catalogProducts: Product[] }) {
  const brandProducts = getBrandProducts(catalogProducts, brand.slug)
  const liveProducts = brandProducts.filter(p => (p.purchasable ?? isPurchasable(p)))
  const previewProducts = brandProducts.filter(p => !(p.purchasable ?? isPurchasable(p)))

  return (
    <Link href={`/brands/${brand.slug}`} className="group block">
      <article data-contrast-surface className="h-full rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition-all hover:border-[var(--pf-orange)]/30 hover:shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-bg)]">
            {brand.logo && <Image src={brand.logo} alt={`${brand.name} logo`} fill className="object-contain p-2" sizes="64px" />}
          </div>
          <div>
            <h2 data-contrast-text className="text-xl font-semibold text-[var(--pf-text)] group-hover:text-[var(--pf-accent-text)] transition-colors">{brand.name}</h2>
            <p data-contrast-text className="text-sm text-[var(--pf-accent-text)]">{brand.tagline}</p>
          </div>
        </div>

        <p className="text-sm text-[var(--pf-text-secondary)] mb-4 line-clamp-2">{brand.description}</p>

        <div className="flex items-center gap-4 text-xs text-[var(--pf-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {liveProducts.length} Live
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--pf-text-muted)]" />
            {previewProducts.length} Preview
          </span>
        </div>

        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--pf-accent-text)]">
          Explore {brand.name}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </article>
    </Link>
  )
}
