import Link from 'next/link'
import { BRANDS, getBrandProducts } from '@/lib/products'
import { isPurchasable } from '@/lib/products'
import { loadCatalogProducts } from '@/lib/product-visibility'
import { Star, ArrowRight } from 'lucide-react'

export default async function BrandsPage() {
  const catalogProducts = await loadCatalogProducts('store')

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        {/* Header */}
        <div className="mb-10 rounded-[32px] border border-[var(--pf-border)]/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(11,11,12,0.96))] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-12">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-[var(--pf-orange)]" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--pf-orange)]">
              Featured Brands
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-white mb-4">
            Founding Brands
          </h1>
          <p className="text-lg text-[var(--pf-text-secondary)] max-w-2xl">
            Independent brands building on Porterful. Discover products from creators you can trust.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {BRANDS.filter(b => b.foundingBrand).map(brand => (
            <BrandCard key={brand.id} brand={brand} catalogProducts={catalogProducts} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BrandCard({ brand, catalogProducts }: { brand: any; catalogProducts: any[] }) {
  const brandProducts = getBrandProducts(catalogProducts, brand.slug)
  const liveProducts = brandProducts.filter(p => (p.purchasable ?? isPurchasable(p)))
  const previewProducts = brandProducts.filter(p => !(p.purchasable ?? isPurchasable(p)))

  return (
    <Link href={`/brands/${brand.slug}`} className="group block">
      <article className="h-full rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-6 transition-all hover:border-[var(--pf-orange)]/30 hover:shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-16 w-16 rounded-2xl bg-[var(--pf-bg)] flex items-center justify-center text-2xl">
            {brand.slug === 'noble-naturals' ? '🌿' : brand.slug === 'marvelous-black' ? '⚫' : '🏠'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white group-hover:text-[var(--pf-orange)] transition-colors">{brand.name}</h2>
            <p className="text-sm text-[var(--pf-orange)]">{brand.tagline}</p>
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

        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--pf-orange)]">
          Explore {brand.name}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </div>
      </article>
    </Link>
  )
}
