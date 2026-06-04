import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BRANDS, getBrandBySlug, getBrandProducts, PRODUCTS, isPurchasable } from '@/lib/products'
import { ArrowLeft, Play, Eye } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params
  const brand = getBrandBySlug(slug)

  if (!brand) {
    notFound()
  }

  const products = getBrandProducts(PRODUCTS, slug)
  const liveProducts = products.filter(p => isPurchasable(p))
  const previewProducts = products.filter(p => !isPurchasable(p))

  const brandEmoji = slug === 'noble-naturals' ? '🌿' : slug === 'marvelous-black' ? '⚫' : '🏠'

  return (
    <div className="min-h-screen bg-[var(--pf-bg)] pt-20 pb-16">
      <div className="pf-container max-w-6xl">
        <Link
          href="/brands"
          className="inline-flex items-center gap-2 text-sm text-[var(--pf-text-secondary)] hover:text-[var(--pf-text)] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Brands
        </Link>

        {/* Brand Header */}
        <div className="mb-10 rounded-[32px] border border-[var(--pf-border)]/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.12),transparent_34%),linear-gradient(180deg,rgba(18,18,20,0.96),rgba(11,11,12,0.96))] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-12">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl bg-[var(--pf-bg)] flex items-center justify-center text-5xl shrink-0">
              {brandEmoji}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl text-white mb-2">{brand.name}</h1>
              <p className="text-lg text-[var(--pf-orange)] font-medium mb-3">{brand.tagline}</p>
              <p className="text-[var(--pf-text-secondary)] max-w-xl">{brand.description}</p>
            </div>
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
                <ProductCard key={product.id} product={product} />
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
                Preview — Coming Soon
              </span>
              <div className="h-px flex-1 bg-[var(--pf-border)]/60" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {previewProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: any }) {
  const purchasable = isPurchasable(product)

  return (
    <Link href={`/store/${product.id}`} className="group block">
      <article className="h-full rounded-[24px] border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4 transition-all hover:border-[var(--pf-orange)]/30">
        <div className="relative aspect-square overflow-hidden rounded-[16px] bg-[var(--pf-bg-secondary)]">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {!purchasable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <span className="rounded-full bg-[var(--pf-surface)] px-4 py-2 text-sm font-semibold text-[var(--pf-text)]">
                Coming Soon
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-[var(--pf-text)] group-hover:text-[var(--pf-orange)] transition-colors">{product.name}</h3>
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
