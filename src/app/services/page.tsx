'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Star, Clock, ShoppingBag, Music, Mic, Bell, Sparkles, Filter, X, ChevronDown, ExternalLink } from 'lucide-react'
import { ARTIST_SERVICES, ArtistService, formatServicePrice, getCategoryInfo, SERVICE_CATEGORIES } from '@/lib/services'

// Service card component
function ServiceCard({ service }: { service: ArtistService }) {
  const categoryInfo = getCategoryInfo(service.category)
  
  return (
    <div className="bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)] overflow-hidden hover:border-[var(--pf-orange)]/50 transition-all group">
      {/* Header */}
      <div className="p-5 border-b border-[var(--pf-border)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Artist Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pf-orange)] to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {service.artistAvatar || service.artistName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--pf-text)]">{service.artistName}</h3>
              <div className="flex items-center gap-1 text-sm text-[var(--pf-text-muted)]">
                <Star size={12} className="text-[var(--pf-orange)] fill-[var(--pf-orange)]" />
                <span>{service.rating}</span>
                <span className="mx-1">•</span>
                <span>{service.orders} orders</span>
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            service.inStock 
              ? 'bg-green-500/10 text-green-500' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {service.inStock ? 'Available' : 'Busy'}
          </span>
        </div>
        
        {/* Service Title */}
        <h4 className="text-lg font-bold mb-2 group-hover:text-[var(--pf-orange)] transition-colors">
          {service.title}
        </h4>
        
        {/* Category & Delivery */}
        <div className="flex items-center gap-3 text-sm text-[var(--pf-text-muted)] mb-3">
          <span className="flex items-center gap-1">
            {categoryInfo.icon} {categoryInfo.label}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {service.deliveryDays} days
          </span>
        </div>
        
        {/* Description */}
        <p className="text-sm text-[var(--pf-text-secondary)] line-clamp-2">
          {service.description}
        </p>
      </div>
      
      {/* Footer */}
      <div className="p-5 bg-[var(--pf-bg)]/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-[var(--pf-orange)]">
              {formatServicePrice(service)}
            </div>
            {service.priceType === 'starting_at' && (
              <div className="text-xs text-[var(--pf-text-muted)]">Base price</div>
            )}
          </div>
          <button className="px-5 py-2.5 bg-[var(--pf-orange)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--pf-orange-dark)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!service.inStock}>
            {service.inStock ? 'Hire Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Add Service Form
function AddServiceForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceType: 'fixed' as const,
    deliveryDays: '7',
    category: 'music_production' as const,
    portfolioLinks: '',
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Connect to Supabase/Backend
    console.log('Service submitted:', formData)
    alert('Service submitted! (Demo mode - backend not connected yet)')
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[var(--pf-surface)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--pf-border)] flex items-center justify-between">
          <h2 className="text-xl font-bold">Add New Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--pf-bg)] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Service Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Custom Jingle, Voiceover, Beat"
              className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value as any})}
            >
              {SERVICE_CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
          </div>
          
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              required
              rows={3}
              placeholder="Describe what you're offering..."
              className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price ($)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="250"
                className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price Type</label>
              <select
                className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
                value={formData.priceType}
                onChange={e => setFormData({...formData, priceType: e.target.value as any})}
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="starting_at">Starting At</option>
              </select>
            </div>
          </div>
          
          {/* Delivery Days */}
          <div>
            <label className="block text-sm font-medium mb-2">Delivery Time (days)</label>
            <input
              type="number"
              required
              min="1"
              placeholder="7"
              className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
              value={formData.deliveryDays}
              onChange={e => setFormData({...formData, deliveryDays: e.target.value})}
            />
          </div>
          
          {/* Portfolio Links */}
          <div>
            <label className="block text-sm font-medium mb-2">Portfolio Link (optional)</label>
            <input
              type="url"
              placeholder="https://soundcloud.com/yourname"
              className="w-full px-4 py-3 bg-[var(--pf-bg)] border border-[var(--pf-border)] rounded-xl focus:outline-none focus:border-[var(--pf-orange)] transition-colors"
              value={formData.portfolioLinks}
              onChange={e => setFormData({...formData, portfolioLinks: e.target.value})}
            />
          </div>
          
          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-[var(--pf-orange)] text-white rounded-xl font-bold text-lg hover:bg-[var(--pf-orange-dark)] transition-colors"
          >
            List My Service
          </button>
        </form>
      </div>
    </div>
  )
}

// Main page component
export default function ServicesPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  const filteredServices = selectedCategory === 'all'
    ? ARTIST_SERVICES
    : ARTIST_SERVICES.filter(s => s.category === selectedCategory)
  
  return (
    <div className="min-h-screen pt-20 pb-24 bg-[var(--pf-bg)]">
      <div className="pf-container max-w-6xl">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--pf-orange)] via-[var(--pf-purple)] to-purple-900 p-8 md:p-12 mb-10">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-xl">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Artist Services
                </h1>
                <p className="text-lg text-white/80 mb-4">
                  Hire talented artists for custom music, voiceovers, jingles, and more. 
                  Support independent creators while getting professional results.
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    🎵 Music Production
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    🎙️ Voiceovers
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                    🔔 Jingles
                  </span>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{ARTIST_SERVICES.length}</div>
                  <div className="text-sm text-white/70">Services</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">4</div>
                  <div className="text-sm text-white/70">Artists</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">179</div>
                  <div className="text-sm text-white/70">Orders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* For Artists & For Businesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* For Artists */}
          <div className="bg-gradient-to-br from-[var(--pf-orange)]/10 to-[var(--pf-orange)]/5 border border-[var(--pf-orange)]/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--pf-orange)] flex items-center justify-center">
                <Music size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">For Artists</h2>
            </div>
            <p className="text-[var(--pf-text-secondary)] mb-5">
              Turn your skills into income. List your services and let businesses come to you. 
              Whether it's voiceovers, custom beats, or full productions — get paid for what you're already good at.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-[var(--pf-text-secondary)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pf-orange)]" />
                Set your own prices and turnaround time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pf-orange)]" />
                Keep 80% of every transaction
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pf-orange)]" />
                Build portfolio with real clients
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--pf-orange)]" />
                Direct deposits to your wallet
              </li>
            </ul>
            <button 
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 bg-[var(--pf-orange)] text-white rounded-xl font-semibold hover:bg-[var(--pf-orange-dark)] transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              List Your Service
            </button>
          </div>
          
          {/* For Businesses */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <h2 className="text-xl font-bold">For Businesses</h2>
            </div>
            <p className="text-[var(--pf-text-secondary)] mb-5">
              Need custom music for your brand? Find talented artists ready to create jingles, 
              voiceovers, background tracks, and more. Support Black artists directly.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-[var(--pf-text-secondary)]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Browse verified artists and portfolios
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Transparent pricing, no hidden fees
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Original content, full rights transfer
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Money stays in our community
              </li>
            </ul>
            <Link 
              href="#services"
              className="block w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors text-center"
            >
              Browse Services
            </Link>
          </div>
        </div>
        
        {/* Services Section */}
        <div id="services">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">Available Services</h2>
              <p className="text-[var(--pf-text-muted)]">{filteredServices.length} services from local artists</p>
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                }`}
              >
                All
              </button>
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-[var(--pf-orange)] text-white'
                      : 'bg-[var(--pf-surface)] border border-[var(--pf-border)] hover:border-[var(--pf-orange)]'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center justify-center gap-2 py-3 bg-[var(--pf-surface)] border border-[var(--pf-border)] rounded-xl"
            >
              <Filter size={18} />
              <span>Filters</span>
              <ChevronDown size={16} />
            </button>
          </div>
          
          {/* Service Cards Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[var(--pf-surface)] rounded-2xl border border-[var(--pf-border)]">
              <Sparkles size={48} className="mx-auto text-[var(--pf-text-muted)] mb-4" />
              <h3 className="text-xl font-bold mb-2">No services in this category</h3>
              <p className="text-[var(--pf-text-muted)] mb-4">Check back soon or browse other categories</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="px-6 py-2 bg-[var(--pf-orange)] text-white rounded-xl font-semibold"
              >
                View All Services
              </button>
            </div>
          )}
        </div>
        
        {/* CTA Banner */}
        <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-[var(--pf-orange)] p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Ready to monetize your skills?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Join O D Porter and other artists turning their talent into steady income.
            List your first service in minutes.
          </p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-8 py-4 bg-white text-[var(--pf-orange)] font-bold rounded-xl hover:bg-white/90 transition-colors"
          >
            Get Started Free
          </button>
        </div>
      </div>
      
      {/* Add Service Modal */}
      {showAddForm && <AddServiceForm onClose={() => setShowAddForm(false)} />}
      
      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setShowMobileFilters(false)}>
          <div 
            className="bg-[var(--pf-surface)] w-full rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Filter by Category</h3>
              <button onClick={() => setShowMobileFilters(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setSelectedCategory('all'); setShowMobileFilters(false); }}
                className={`p-4 rounded-xl text-left font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[var(--pf-orange)] text-white'
                    : 'bg-[var(--pf-bg)] border border-[var(--pf-border)]'
                }`}
              >
                All Services
              </button>
              {SERVICE_CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setSelectedCategory(cat.value); setShowMobileFilters(false); }}
                  className={`p-4 rounded-xl text-left font-medium transition-colors ${
                    selectedCategory === cat.value
                      ? 'bg-[var(--pf-orange)] text-white'
                      : 'bg-[var(--pf-bg)] border border-[var(--pf-border)]'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
