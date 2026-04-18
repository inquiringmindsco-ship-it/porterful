'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Upload, Save, ArrowLeft, X, Image as ImageIcon,
  Plus, Trash2, AlertCircle, Check, Eye, EyeOff
} from 'lucide-react'
import { useSupabase } from '@/app/providers'

const CATEGORIES = [
  { value: 'apparel', label: 'Apparel (T-shirts, Hoodies)' },
  { value: 'accessories', label: 'Accessories (Hats, Bags, Wristbands)' },
  { value: 'art', label: 'Art (Prints, Posters, Canvases)' },
  { value: 'music', label: 'Music (Vinyl, CDs)' },
  { value: 'tech', label: 'Tech (Cases, Gadgets)' },
  { value: 'home', label: 'Home & Living (Decor, Kitchen)' },
  { value: 'other', label: 'Other' },
]

interface Variant {
  id: string
  name: string
  price: string
  sku: string
}

export default function AddProductPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useSupabase()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [variants, setVariants] = useState<Variant[]>([])
  const [printfulProductId, setPrintfulProductId] = useState('')

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // ─── Guards (after all hooks, before event handlers) ───────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (authLoading) return (
    <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
      <div className="text-[var(--pf-text-muted)]">Loading...</div>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-[var(--pf-orange)] mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign in required</h2>
        <p className="text-[var(--pf-text-secondary)] mb-4">You need to be signed in to add products.</p>
        <Link href="/login" className="pf-btn pf-btn-primary">Sign In</Link>
      </div>
    </div>
  )

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'product-images')

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok || data.error) throw new Error(data.error || 'Upload failed')

      setImages(prev => [...prev, data.url])
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(`Image upload failed: ${err.message}`)
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }, [user])

  const removeImage = (url: string) => {
    setImages(prev => prev.filter(u => u !== url))
  }

  const addVariant = () => {
    setVariants(prev => [
      ...prev,
      { id: crypto.randomUUID(), name: '', price: price || '', sku: '' }
    ])
  }

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  const handleSubmit = async (status: 'draft' | 'live') => {
    setError('')

    if (!title.trim()) { setError('Product title is required.'); return }
    if (!category) { setError('Category is required.'); return }
    if (!price || parseFloat(price) <= 0) { setError('Valid price is required.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          price: parseFloat(price),
          image_url: images[0] || null,
          metadata: images.length > 0 ? { images } : null,
          variants: variants.filter(v => v.name.trim()),
          printful_product_id: printfulProductId.trim() || null,
          status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create product.')
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard/dashboard/artist'), 1500)
    } catch (err) {
      console.error('Submit error:', err)
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Product created!</h2>
          <p className="text-[var(--pf-text-secondary)] mb-4">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/dashboard/artist" className="p-2 rounded-lg hover:bg-[var(--pf-surface)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add Product</h1>
            <p className="text-sm text-[var(--pf-text-muted)]">Create a new merch product</p>
          </div>
        </div>

        {/* Earnings info banner */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <Check className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--pf-text-muted)]">
            You can sell now. Likeness verification is only required to withdraw earnings.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-6">

          {/* Images */}
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-5">
            <h2 className="font-semibold mb-1">Product Images</h2>
            <p className="text-sm text-[var(--pf-text-muted)] mb-4">Upload up to 6 images. First image is the cover.</p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--pf-bg)] border border-[var(--pf-border)]">
                  <Image src={url} alt={`Image ${i + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-red-500 transition-colors"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[var(--pf-orange)] text-white text-xs rounded font-medium">Cover</span>
                  )}
                </div>
              ))}

              {images.length < 6 && (
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="aspect-square rounded-xl border-2 border-dashed border-[var(--pf-border)] hover:border-[var(--pf-orange)] flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <div className="w-5 h-5 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <ImageIcon size={20} className="text-[var(--pf-text-muted)]" />
                      <span className="text-xs text-[var(--pf-text-muted)]">Add</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Basic Info */}
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-5">
            <h2 className="font-semibold mb-4">Basic Info</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Product Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. METTLE T-Shirt"
                  className="w-full px-4 py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Category *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text)] focus:outline-none focus:border-[var(--pf-orange)]"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)]">$</span>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="25.00"
                      className="w-full pl-7 pr-4 py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold mb-1">Variants <span className="text-[var(--pf-text-muted)] font-normal">(optional)</span></h2>
                <p className="text-sm text-[var(--pf-text-muted)]">e.g. sizes S/M/L or color options</p>
              </div>
              <button
                onClick={addVariant}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--pf-orange)] hover:bg-[var(--pf-orange)]/10 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add Variant
              </button>
            </div>

            {variants.length > 0 && (
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-[var(--pf-bg)] rounded-lg">
                    <span className="text-xs text-[var(--pf-text-muted)] w-6">#{i + 1}</span>
                    <input
                      type="text"
                      value={v.name}
                      onChange={e => updateVariant(v.id, 'name', e.target.value)}
                      placeholder="Name (e.g. Size: M)"
                      className="flex-1 px-3 py-1.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded text-sm focus:outline-none focus:border-[var(--pf-orange)]"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pf-text-muted)] text-sm">$</span>
                      <input
                        type="number"
                        value={v.price}
                        onChange={e => updateVariant(v.id, 'price', e.target.value)}
                        placeholder="0"
                        className="w-full pl-6 pr-3 py-1.5 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded text-sm focus:outline-none focus:border-[var(--pf-orange)]"
                      />
                    </div>
                    <button
                      onClick={() => removeVariant(v.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Printful */}
          <div className="bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl p-5">
            <h2 className="font-semibold mb-1">Printful Integration <span className="text-[var(--pf-text-muted)] font-normal">(optional)</span></h2>
            <p className="text-sm text-[var(--pf-text-muted)] mb-4">
              Paste your Printful product ID to sync fulfillment. Leave blank for manual fulfillment.
            </p>

            <div>
              <label className="block text-sm font-medium mb-1.5">Printful Product ID</label>
              <input
                type="text"
                value={printfulProductId}
                onChange={e => setPrintfulProductId(e.target.value)}
                placeholder="e.g. 1234567"
                className="w-full px-4 py-2.5 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-lg text-[var(--pf-text)] placeholder:text-[var(--pf-text-muted)] focus:outline-none focus:border-[var(--pf-orange)]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-8">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="flex-1 py-3 border border-[var(--pf-border)] rounded-xl font-medium hover:border-[var(--pf-orange)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[var(--pf-orange)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <EyeOff size={16} /> Save as Draft
                </>
              )}
            </button>
            <button
              onClick={() => handleSubmit('live')}
              disabled={loading}
              className="flex-1 py-3 bg-[var(--pf-orange)] text-white rounded-xl font-medium hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Eye size={16} /> Publish Now
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
