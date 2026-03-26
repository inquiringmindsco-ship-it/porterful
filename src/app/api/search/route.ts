import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ artists: [], products: [], stations: [] });
  }

  try {
    const supabase = createServerClient();
    const searchTerm = `%${query}%`;

    // Search artists
    const { data: artists } = await supabase
      .from('profiles')
      .select(`
        id,
        name,
        slug,
        avatar_url,
        genres
      `)
      .or(`name.ilike.${searchTerm},display_name.ilike.${searchTerm}`)
      .limit(5);

    // Search products
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        image,
        artists:artist_id (
          name
        )
      `)
      .or(`name.ilike.${searchTerm}`)
      .eq('is_active', true)
      .limit(5);

    // Format products with artist name
    const formattedProducts = products?.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      artistName: (p as any).artists?.name || 'Unknown Artist'
    })) || [];

    // Get track/product counts for artists
    const artistIds = artists?.map(a => a.id) || [];
    let artistStats: Record<string, { tracks: number; products: number }> = {};

    if (artistIds.length > 0) {
      // Get track counts
      const { data: tracks } = await supabase
        .from('tracks')
        .select('artist_id')
        .in('artist_id', artistIds);
      
      // Get product counts
      const { data: prods } = await supabase
        .from('products')
        .select('artist_id')
        .in('artist_id', artistIds)
        .eq('is_active', true);

      // Count per artist
      artistIds.forEach(id => {
        artistStats[id] = {
          tracks: tracks?.filter(t => t.artist_id === id).length || 0,
          products: prods?.filter(p => p.artist_id === id).length || 0
        };
      });
    }

    // Format artists with stats
    const formattedArtists = artists?.map(a => ({
      id: a.id,
      name: a.name || a.display_name,
      slug: a.slug,
      avatar: a.avatar_url,
      genre: a.genres?.[0] || null,
      trackCount: artistStats[a.id]?.tracks || 0,
      productCount: artistStats[a.id]?.products || 0
    })) || [];

    return NextResponse.json({
      artists: formattedArtists,
      products: formattedProducts,
      stations: []
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
