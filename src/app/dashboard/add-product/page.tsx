'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/app/providers'
import { useRouter } from 'next/navigation'
import { 
  Upload, DollarSign, Package, Link, ChevronLeft, 
  Check, AlertCircle 
} from 'lucide-react'

const CATEGORIES = [
  { value: 'artist_merch', label: 'Artist Merch', description: 'T-shirts, vinyl, CDs, signed items' },
  { value: 'essentials', label: 'Essentials', description: 'Toothpaste, soap, household items' },
  { value: 'trending', label: 'Trending', description: 'Viral products, limited drops' },
  { value: 'digital', label: 'Digital', description: 'Albums, singles, digital art' },
  { value: 'service', label: 'Service', description: 'Mixing, mastering, design' },
]

const DROPSHIP_PROVIDERS = [
  { value: 'none', label: 'Self-fulfilled', description: 'I handle shipping myself' },
  { value: 'printful', label: 'Printful', description: 'Print-on-demand apparel & merch' },
  { value: 'zendrop', label: 'Zendrop', description: 'Dropshipping products' },
  { value: 'cj_dropshipping', label: 'CJ Dropshipping', description: 'AliExpress dropshipping' },
]

export default function AddProductPage() {
  const { user, supabase } = useSupabase()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'artist_merch',
    price: '',
    cost: '',
    images: [] as string[],
    variants: [] as { name: string; price: number; sku: string }[],
    inventory_count: '',
    dropship_provider: 'none',
    dropship_product_id: '',
    linked_artist_id: '',
  })

  useEffect(() => {
    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/login')
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()
      setProfile(data)
      if (data?.role !== 'artist') {
        router.push('/dashboard')
        return
      }
      setPageLoading(false)
    }
    checkAccess()
  }, [supabase, router])

  if (pageLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[var(--pf-surface)] rounded w-1/4" />
            <div className="h-32 bg-[var(--pf-surface)] rounded" />
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      router.push('/login')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create product via API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost) || 0,
          images: formData.images,
          variants: formData.variants,
          inventory_count: parseInt(formData.inventory_count) || 999,
          dropship_provider: formData.dropship_provider,
          dropship_product_id: formData.dropship_product_id,
          linked_artist_id: formData.linked_artist_id || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create product')
      }

      router.push('/dashboard?tab=products')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="pf-container">
          <div className="pf-card p-12 text-center">
            <p className="text-[var(--pf-text-secondary)] mb-4">Sign in to add products</p>
            <button onClick={() => router.push('/login')} className="pf-btn pf-btn-primary">
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-3xl">
        {/* Back */}
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-[var(--pf-text-secondary)] hover:text-white mb-6"
        >
          <ChevronLeft size={18} />
          Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-2">Add Product</h1>
        <p className="text-[var(--pf-text-secondary)] mb-8">
          List your product on the Porterful marketplace
        </p>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s 
                  ? 'bg-[var(--pf-orange)] text-white' 
                  : 'bg-[var(--pf-surface)] text-[var(--pf-text-muted)]'
              }`}>
                {step > s ? <Check size={16} /> : s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-white' : 'text-[var(--pf-text-muted)]'}`}>
                {s === 1 ? 'Details' : s === 2 ? 'Pricing' : 'Publish'}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="pf-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Ambiguous Tour T-Shirt"
                  className="pf-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your product..."
                  className="pf-input min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        formData.category === cat.value
                          ? 'border-[var(--pf-orange)] bg-[var(--pf-orange)]/10'
                          : 'border-[var(--pf-border)] hover:border-[var(--pf-border-hover)]'
                      }`}
                    >
                      <p className="font-medium">{cat.label}</p>
                      <p className="text-sm text-[var(--pf-text-muted)]">{cat.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fulfillment Method</label>
                <select
                  name="dropship_provider"
                  value={formData.dropship_provider}
                  onChange={handleInputChange}
                  className="pf-input"
                >
                  {DROPSHIP_PROVIDERS.map((provider) => (
                    <option key={provider.value} value={provider.value}>
                      {provider.label} - {provider.description}
                    </option>
                  ))}
                </select>
              </div>

              {formData.dropship_provider !== 'none' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Provider Product ID</label>
                  <input
                    type="text"
                    name="dropship_product_id"
                    value={formData.dropship_product_id}
                    onChange={handleInputChange}
                    placeholder="e.g., PRINTFUL-12345"
                    className="pf-input"
                  />
                  <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                    Enter the product ID from your {DROPSHIP_PROVIDERS.find(p => p.value === formData.dropship_provider)?.label} account
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="pf-btn pf-btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="pf-card p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Price ($) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={18} />
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="29.99"
                    step="0.01"
                    min="0"
                    className="pf-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cost ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={18} />
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="12.00"
                    step="0.01"
                    min="0"
                    className="pf-input pl-10"
                  />
                </div>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                  Your cost to produce/fulfill (for profit calculation)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Inventory</label>
                <div className="relative">
                  <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]" size={18} />
                  <input
                    type="number"
                    name="inventory_count"
                    value={formData.inventory_count}
                    onChange={handleInputChange}
                    placeholder="999"
                    min="0"
                    className="pf-input pl-10"
                  />
                </div>
                <p className="text-xs text-[var(--pf-text-muted)] mt-1">
                  Leave blank for unlimited (dropship)
                </p>
              </div>

              {/* Revenue Split Info */}
              <div className="bg-[var(--pf-bg)] rounded-lg p-4">
                <h3 className="font-semibold mb-3">Revenue Split</h3>
                <p className="text-sm text-[var(--pf-text-secondary)] mb-4">
                  Every purchase on Porterful is split to support artists.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--pf-text-muted)]">You (creator)</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--pf-text-muted)]">Artist Fund</span>
                    <span className="font-medium text-[var(--pf-orange)]">20%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--pf-text-muted)]">Superfan</span>
                    <span className="font-medium">3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--pf-text-muted)]">Porterful</span>
                    <span className="font-medium">10%</span>
                  </div>
                </div>
                {formData.price && (
                  <div className="mt-4 pt-4 border-t border-[var(--pf-border)]">
                    <p className="text-sm text-[var(--pf-text-secondary)]">
                      At ${formData.price}, you earn: <span className="font-bold text-white">${(parseFloat(formData.price) * 0.67).toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="pf-btn pf-btn-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="pf-btn pf-btn-primary"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Publish */}
          {step === 3 && (
            <div className="pf-card p-6 space-y-6">
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--pf-orange)]/20 flex items-center justify-center">
                  <Package className="text-[var(--pf-orange)]" size={32} />
                </div>
                <h2 className="text-xl font-bold mb-2">Ready to Publish</h2>
                <p className="text-[var(--pf-text-secondary)]">
                  Your product will be live on the marketplace immediately
                </p>
              </div>

              {/* Summary */}
              <div className="bg-[var(--pf-bg)] rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-muted)]">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-muted)]">Category</span>
                  <span className="font-medium">{CATEGORIES.find(c => c.value === formData.category)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-muted)]">Price</span>
                  <span className="font-medium">${formData.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-muted)]">You earn</span>
                  <span className="font-bold text-[var(--pf-orange)]">${(parseFloat(formData.price) * 0.67).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--pf-text-muted)]">Fulfillment</span>
                  <span className="font-medium">{DROPSHIP_PROVIDERS.find(p => p.value === formData.dropship_provider)?.label}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="pf-btn pf-btn-secondary"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="pf-btn pf-btn-primary"
                >
                  {loading ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}