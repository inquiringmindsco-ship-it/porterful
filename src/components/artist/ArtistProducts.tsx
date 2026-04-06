'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/lib/products'

interface ArtistProductsProps {
  products: Product[]
  artistName: string
}

export function ArtistProducts({ products, artistName }: ArtistProductsProps) {
  const displayProducts = products.slice(0, 3)

  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl p-5 border border-[var(--pf-border)] min-h-[200px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm uppercase tracking-widest text-[var(--pf-orange)]">{artistName} Store</p>
        <Link href="/shop" className="text-xs text-[var(--pf-text-muted)] hover:text-[var(--pf-orange)] transition-colors" title="Browse all merch">
          View all →
        </Link>
      </div>

      <div className="space-y-2.5 flex-1">
        {displayProducts.length > 0 ? (
          displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/product/${product.id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 transition-colors group"
            >
              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black shrink-0">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--pf-border)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{product.name}</p>
                <p className="text-xs text-[var(--pf-text-muted)]">{product.category}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-semibold">${product.price}</span>
                <ArrowRight size={12} className="text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)] transition-colors" />
              </div>
            </Link>
          ))
        ) : (
          <>
            <div className="mb-3">
              <p className="text-sm font-semibold text-[var(--pf-text)]">{artistName} Store</p>
              <p className="text-xs text-[var(--pf-text-muted)]">Powered by Porterful</p>
            </div>
            <div className="space-y-2">
              {[
                { id: 'starter-tee', name: 'Support Tee', price: 28, category: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800' },
                { id: 'starter-hoodie', name: 'Support Hoodie', price: 55, category: 'Apparel', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800' },
                { id: 'starter-mug', name: 'Support Mug', price: 18, category: 'Accessories', image: 'https://images.unsplash.com/photo-1514228742587-6b8b3b3a0d66?w=800' },
              ].map((product) => (
                <Link
                  key={product.id}
                  href={`/product/product/${product.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--pf-bg)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]/40 transition-colors group"
                >
                  <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-black shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-[var(--pf-text-muted)]">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-semibold">${product.price}</span>
                    <ArrowRight size={12} className="text-[var(--pf-text-muted)] group-hover:text-[var(--pf-orange)] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-[var(--pf-text-muted)] mt-3 text-center">This purchase supports {artistName}</p>
          </>
        )}
      </div>
    </div>
  )
}
