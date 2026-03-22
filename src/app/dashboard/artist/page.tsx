'use client';

import { useState } from 'react';
import { useSupabase } from '@/app/providers';
import { TRACKS, ALBUMS, PRODUCTS } from '@/lib/data';
import Link from 'next/link';
import { Music, Package, Upload, Settings, Star, Eye, EyeOff, Trash2, Edit, Plus, ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function ArtistDashboardPage() {
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState<'tracks' | 'albums' | 'products'>('albums');
  const [albums, setAlbums] = useState(Object.values(ALBUMS));
  const [featured, setFeatured] = useState<string[]>([]);

  // Group tracks by album
  const tracksByAlbum = TRACKS.reduce((acc, track) => {
    const album = track.album || 'Singles';
    if (!acc[album]) acc[album] = [];
    acc[album].push(track);
    return acc;
  }, {} as Record<string, typeof TRACKS>);

  const moveAlbumUp = (index: number) => {
    if (index === 0) return;
    const newAlbums = [...albums];
    [newAlbums[index - 1], newAlbums[index]] = [newAlbums[index], newAlbums[index - 1]];
    setAlbums(newAlbums);
  };

  const moveAlbumDown = (index: number) => {
    if (index >= albums.length - 1) return;
    const newAlbums = [...albums];
    [newAlbums[index], newAlbums[index + 1]] = [newAlbums[index + 1], newAlbums[index]];
    setAlbums(newAlbums);
  };

  const toggleFeatured = (albumId: string) => {
    setFeatured(prev => prev.includes(albumId) ? prev.filter(id => id !== albumId) : [...prev, albumId]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="pf-container max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Artist Dashboard</h1>
            <p className="text-[var(--pf-text-secondary)]">Manage your music, albums, and products</p>
          </div>
          <Link href="/dashboard/upload" className="pf-btn pf-btn-primary">
            <Upload size={18} className="inline mr-2" />Upload New
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <Music className="text-purple-400" size={24} />
              <div>
                <p className="text-2xl font-bold">{TRACKS.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Tracks</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <Package className="text-[var(--pf-orange)]" size={24} />
              <div>
                <p className="text-2xl font-bold">{Object.keys(ALBUMS).length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Albums</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <Star className="text-yellow-400" size={24} />
              <div>
                <p className="text-2xl font-bold">{PRODUCTS.length}</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Products</p>
              </div>
            </div>
          </div>
          <div className="pf-card p-4">
            <div className="flex items-center gap-3">
              <Eye className="text-blue-400" size={24} />
              <div>
                <p className="text-2xl font-bold">{TRACKS.reduce((sum, t) => sum + (t.plays || 0), 0) / 1000}K</p>
                <p className="text-sm text-[var(--pf-text-muted)]">Plays</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[var(--pf-border)] mb-6">
          <div className="flex gap-8">
            {(['albums', 'tracks', 'products'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 font-semibold capitalize ${activeTab === tab ? 'text-[var(--pf-orange)] border-b-2 border-[var(--pf-orange)]' : 'text-[var(--pf-text-muted)] hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Album Order</h2>
              <p className="text-sm text-[var(--pf-text-muted)]">Drag to reorder how albums appear on your profile</p>
            </div>
            {albums.map((album, index) => (
              <div key={album.id} className={`pf-card p-4 ${featured.includes(album.id) ? 'ring-2 ring-[var(--pf-orange)]' : ''}`}>
                <div className="flex items-center gap-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => moveAlbumUp(index)} disabled={index === 0} className="p-1 hover:bg-[var(--pf-surface)] rounded disabled:opacity-30">
                      <ChevronUp size={16} />
                    </button>
                    <button onClick={() => moveAlbumDown(index)} disabled={index === albums.length - 1} className="p-1 hover:bg-[var(--pf-surface)] rounded disabled:opacity-30">
                      <ChevronDown size={16} />
                    </button>
                  </div>
                  
                  {/* Album art */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[var(--pf-orange)]/30 to-purple-600/30 flex items-center justify-center shrink-0">
                    {album.image ? <img src={album.image} alt={album.name} className="w-full h-full object-cover" /> : <Music size={24} className="text-white/50" />}
                  </div>
                  
                  {/* Album info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{album.name}</h3>
                      {featured.includes(album.id) && <span className="bg-[var(--pf-orange)]/20 text-[var(--pf-orange)] text-xs px-2 py-0.5 rounded">Featured</span>}
                    </div>
                    <p className="text-sm text-[var(--pf-text-muted)]">{album.year} • {album.tracks} tracks</p>
                    <p className="text-sm text-[var(--pf-text-secondary)]">{tracksByAlbum[album.name]?.length || 0} songs uploaded</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFeatured(album.id)} className={`pf-btn ${featured.includes(album.id) ? 'bg-[var(--pf-orange)] text-white' : 'pf-btn-secondary'}`} title={featured.includes(album.id) ? 'Remove from featured' : 'Feature this album'}>
                      <Star size={16} className={featured.includes(album.id) ? 'fill-white' : ''} />
                    </button>
                    <button className="pf-btn pf-btn-secondary">
                      <Edit size={16} />
                    </button>
                    <button className="pf-btn pf-btn-secondary">
                      {true ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tracks Tab */}
        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">All Tracks</h2>
              <div className="flex gap-2">
                <input type="text" placeholder="Search tracks..." className="pf-input w-48" />
              </div>
            </div>
            {Object.entries(tracksByAlbum).map(([album, tracks]) => (
              <div key={album} className="pf-card">
                <div className="p-4 border-b border-[var(--pf-border)]">
                  <h3 className="font-bold">{album}</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">{tracks.length} tracks</p>
                </div>
                <div className="divide-y divide-[var(--pf-border)]">
                  {tracks.slice(0, 5).map(track => (
                    <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-[var(--pf-surface-hover)]">
                      <div className="w-10 h-10 rounded overflow-hidden bg-[var(--pf-surface)]">
                        <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-[var(--pf-text-muted)]">{track.plays?.toLocaleString() || '0'} plays</p>
                      </div>
                      <span className="text-sm font-medium">${track.price}</span>
                      <button className="p-2 hover:bg-[var(--pf-surface)] rounded text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {tracks.length > 5 && (
                    <button className="w-full p-3 text-center text-[var(--pf-orange)] hover:bg-[var(--pf-surface-hover)]">
                      View all {tracks.length} tracks
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Merch & Products</h2>
              <Link href="/dashboard/add-product" className="pf-btn pf-btn-primary">
                <Plus size={18} className="inline mr-2" />Add Product
              </Link>
            </div>
            {PRODUCTS.map(product => (
              <div key={product.id} className="pf-card p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--pf-surface)]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-sm text-[var(--pf-text-muted)]">{product.category} • ${product.price}</p>
                  <p className="text-sm text-green-400">${product.artistCut} to artist</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${product.inStock ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {product.inStock ? 'Live' : 'Draft'}
                  </span>
                  <button className="pf-btn pf-btn-secondary">
                    <Edit size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Link */}
        <div className="mt-8 pt-8 border-t border-[var(--pf-border)]">
          <Link href="/settings" className="pf-btn pf-btn-secondary">
            <Settings size={18} className="inline mr-2" />Account Settings
          </Link>
        </div>
      </div>
    </div>
  );
}