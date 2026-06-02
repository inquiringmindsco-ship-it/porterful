-- Migration 039: Controlled merch activation
-- Single founder-approved merch product for the Coming Home test asset.

BEGIN;

UPDATE public.production_assets
SET artist_id = 'd1a19160-732f-44c4-8040-9cc20fcb9e05'
WHERE asset_id = '241d0c66-c1aa-4c36-ae33-bad98f31c34a';

UPDATE public.product_skus
SET
  product_id = '75006c54-3f40-4309-81a1-a85de8f34841',
  artist_id = 'd1a19160-732f-44c4-8040-9cc20fcb9e05',
  updated_at = NOW()
WHERE sku_id = 'eb4a802e-e00a-42cf-8e01-ea8ac8a7e773';

INSERT INTO public.products (
  id,
  seller_id,
  seller_type,
  category,
  title,
  description,
  metadata,
  price,
  images,
  variants,
  inventory_count,
  status,
  printful_sync_status,
  printful_product_id,
  is_active
) VALUES (
  '75006c54-3f40-4309-81a1-a85de8f34841',
  'd1a19160-732f-44c4-8040-9cc20fcb9e05',
  'artist',
  'artist_merch',
  'Coming Home Tee',
  'Controlled IMG Fulfillment test product linked to the Coming Home asset.',
  jsonb_build_object(
    'sku_id', 'eb4a802e-e00a-42cf-8e01-ea8ac8a7e773',
    'sku_code', 'COMING-HOME-TEE-001',
    'production_asset_id', '241d0c66-c1aa-4c36-ae33-bad98f31c34a',
    'fulfillment_type', 'img_fulfillment',
    'catalog_status', 'controlled_test',
    'artist_id', 'd1a19160-732f-44c4-8040-9cc20fcb9e05',
    'artist_name', 'ATM Trap',
    'artist_handle', 'atm-trap',
    'retail_price_cents', 3000,
    'unit_cost_cents', 750
  ),
  30.00,
  jsonb_build_array('/artist-images/atm-trap/avatar.jpg'),
  jsonb_build_array(
    jsonb_build_object(
      'sku_id', 'eb4a802e-e00a-42cf-8e01-ea8ac8a7e773',
      'sku_code', 'COMING-HOME-TEE-001',
      'production_asset_id', '241d0c66-c1aa-4c36-ae33-bad98f31c34a',
      'fulfillment_type', 'img_fulfillment',
      'size', 'L',
      'color', 'Black',
      'retail_price_cents', 3000,
      'unit_cost_cents', 750
    )
  ),
  1,
  'live',
  'not_linked',
  NULL,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  seller_id = EXCLUDED.seller_id,
  seller_type = EXCLUDED.seller_type,
  category = EXCLUDED.category,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  variants = EXCLUDED.variants,
  inventory_count = EXCLUDED.inventory_count,
  status = EXCLUDED.status,
  printful_sync_status = EXCLUDED.printful_sync_status,
  printful_product_id = EXCLUDED.printful_product_id,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

COMMIT;
