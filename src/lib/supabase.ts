import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role (for admin operations)
export function createServerClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      persistSession: false
    }
  })
}

// Auth helpers
export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export async function signInWithOAuth(provider: 'google' | 'facebook' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
    }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

// Profile helpers
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, artists(*)')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

// Product helpers
export async function getProducts(category?: string) {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  return { data, error }
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

// Station helpers
export async function getStations() {
  const { data, error } = await supabase
    .from('stations')
    .select('*, artists(*)')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getStation(id: string) {
  const { data, error } = await supabase
    .from('stations')
    .select('*, artists(*), tracks(*)')
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getTracks(stationId: string) {
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('station_id', stationId)
    .order('created_at', { ascending: false })
  return { data, error }
}

// Order helpers
export async function createOrder(userId: string, items: any[], total: number) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      total,
      subtotal: total,
      status: 'pending'
    })
    .select()
    .single()
  
  if (orderError) return { data: null, error: orderError }
  
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
    commission: item.price * item.commission_rate * item.quantity
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  return { data: order, error: itemsError }
}