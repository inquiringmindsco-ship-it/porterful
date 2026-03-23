-- Products table for marketplace
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  printful_id TEXT,
  printful_variant_id TEXT,
  images TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  colors TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  artist_id UUID,
  artist_name TEXT DEFAULT 'Porterful',
  artist_cut DECIMAL(10, 2) DEFAULT 0.80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stripe_payment_intent_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address JSONB,
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  printful_order_id TEXT,
  tracking_number TEXT,
  estimated_delivery DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items for multi-vendor split
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  artist_cut DECIMAL(10, 2),
  artist_id UUID,
  status TEXT DEFAULT 'pending',
  printful_order_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_artist ON products(artist_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_artist ON order_items(artist_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Apparel', 'apparel', 'Clothing and wearables', 1),
('Accessories', 'accessories', 'Phone cases, bags, hats', 2),
('Home & Living', 'home-living', 'Home decor and kitchen', 3),
('Music', 'music', 'Vinyl, CDs, digital music', 4),
('Art', 'art', 'Posters, canvases, prints', 5),
('Tech', 'tech', 'Phone cases, chargers, gadgets', 6)
ON CONFLICT (slug) DO NOTHING;

-- Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read for products
CREATE POLICY "Products are publicly readable" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to create orders
CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH AUTHENTICATED = true;

-- Allow users to read their own orders
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (auth.uid()::text = customer_email);