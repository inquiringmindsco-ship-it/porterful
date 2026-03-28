-- Fix products table RLS policies

-- Allow anyone to read products
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);

-- Allow authenticated users to insert products
DROP POLICY IF EXISTS "Users can insert products" ON products;
CREATE POLICY "Users can insert products" ON products FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow owners to update their own products
DROP POLICY IF EXISTS "Owners can update products" ON products;
CREATE POLICY "Owners can update products" ON products FOR UPDATE USING (auth.uid() = seller_id);

-- Allow owners to delete their own products
DROP POLICY IF EXISTS "Owners can delete products" ON products;
CREATE POLICY "Owners can delete products" ON products FOR DELETE USING (auth.uid() = seller_id);