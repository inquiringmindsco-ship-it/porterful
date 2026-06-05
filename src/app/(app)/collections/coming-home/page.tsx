import Link from 'next/link'
import Image from 'next/image'
import { COMING_HOME_COLLECTION, getCollectionProducts } from '@/lib/products'
import { isPurchasable } from '@/lib/products'
import { loadCatalogProducts } from '@/lib/product-visibility'
import { Home, ArrowLeft, Play, Eye } from 'lucide-react'

export default async function ComingHomeCollectionPage() {
  const collection = COMING_HOME_COLLECTION
  const products = getCollectionProducts(await loadCatalogProducts('store'), collection.slug)
  const liveProducts = products.filter(p => (p.purchasable ?? isPurchasable(p)))
  const previewProducts = products.filter(p => !(p.purchasable ?? isPurchasable(p)))

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        {/* Back link */}
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        {/* Collection Header */}
        <div
          className="mb-10 rounded-[32px] border p-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-12"
          style={{
            borderColor: `${collection.color}30`,
            background: `radial-gradient(circle_at_top_left,${collection.color}18,transparent_40%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(11,11,12,0.96))`,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Home size={20} style={{ color: collection.color }} />
            <span
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: collection.color }}
            >
              Collection
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-white mb-4">
            {collection.name}
          </h1>
          <p className="text-lg sm:text-xl text-[var(--pf-text-secondary)] max-w-2xl mb-6">
            {collection.tagline}
          </p>

          <div className="max-w-2xl">
            <p className="text-sm text-[var(--pf-text-secondary)] leading-relaxed whitespace-pre-line">
              {collection.story}
            </p>
          </div>
        </div>

        {/* Live Products */}
        {liveProducts.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-emerald-500/20" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                <Play size={12} />
                Live Now
              </span>
              <div className="h-px flex-1 bg-emerald-500/20" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {liveProducts.map(product => (
                <ProductCard key={product.id} product={product} collection={collection} />
              ))}
            </div>
          </section>
        )}

        {/* Preview Products */}
        {previewProducts.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--pf-border)]/60" />
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--pf-text-muted)]">
                <Eye size={12} />
                Coming Soon
              </span>
              <div className="h-px flex-1 bg-[var(--pf-border)]/60" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {previewProducts.map(product => (
                <ProductCard key={product.id} product={product} collection={collection} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product, collection }: { product: any; collection: any }) {
  const purchasable = product.purchasable ?? isPurchasable(product)

  return (
    <Link href={`/store/${product.id}`} className="group block">
      <article className="h-full rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-all hover:border-[var(--pf-border-hover)] hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[var(--pf-bg-secondary)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {/* Collection Badge */}
          <div
            className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${collection.color}20`,
              color: collection.color,
              border: `1px solid ${collection.color}30`,
            }}
          >
            <Home size={12} />
            Coming Home™
          </div>
          {!purchasable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <span className="rounded-full bg-[var(--pf-surface)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)]">
                Coming Soon
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-[var(--pf-text)] group-hover:text-[var(--pf-orange)] transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--pf-text-secondary)]">{product.artist}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-bold text-[var(--pf-text)]">${product.price}</span>
            <span className={`text-xs font-medium ${purchasable ? 'text-emerald-400' : 'text-[var(--pf-text-muted)]'}`}>
              {purchasable ? 'In Stock' : 'Preview'}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
