# PORTERFUL CONTROLLED MERCH ACTIVATION MVP REPORT

## Status

PASS for the controlled activation flow in code and production data.

The storefront build now contains one controlled merch product, the live production tables are linked to the approved asset/SKU, and the checkout → order → inventory reservation → fulfillment queue → shipment event chain was smoke-tested against the compiled handlers.

## Files Changed

- [src/lib/products.ts](/Users/sentinel/Documents/porterful/src/lib/products.ts)
- [src/lib/controlled-merch.ts](/Users/sentinel/Documents/porterful/src/lib/controlled-merch.ts)
- [src/lib/checkout-catalog.ts](/Users/sentinel/Documents/porterful/src/lib/checkout-catalog.ts)
- [src/components/product/ProductDetailPage.tsx](/Users/sentinel/Documents/porterful/src/components/product/ProductDetailPage.tsx)
- [src/app/(app)/api/checkout/route.ts](/Users/sentinel/Documents/porterful/src/app/(app)/api/checkout/route.ts)
- [src/app/api/webhooks/stripe/route.ts](/Users/sentinel/Documents/porterful/src/app/api/webhooks/stripe/route.ts)
- [supabase/migrations/039_controlled_merch_activation.sql](/Users/sentinel/Documents/porterful/supabase/migrations/039_controlled_merch_activation.sql)

## Product Activated

- Product ID: `75006c54-3f40-4309-81a1-a85de8f34841`
- Title: `Coming Home Tee`
- Artist: `ATM Trap`
- Fulfillment type: `img_fulfillment`
- Catalog status: `controlled_test`
- Product status: `live`
- Live seller row: `seller_id = d1a19160-732f-44c4-8040-9cc20fcb9e05`

## SKU Used

- SKU ID: `eb4a802e-e00a-42cf-8e01-ea8ac8a7e773`
- SKU Code: `COMING-HOME-TEE-001`
- Production Asset: `241d0c66-c1aa-4c36-ae33-bad98f31c34a`

## Checkout Path Tested

- Checkout route returned a live Stripe session URL for the controlled merch product.
- Session ID: `cs_live_a1sRwfdqrQpuZQkCGnbv922bsAXdKeXHCMYnlvQNHPtXaEgud57jlqMfAu`
- Breakdown:
  - Subtotal: `$30.00`
  - Shipping: `$5.00`
  - Total: `$35.00`

## Order Created

- Order ID: `cd570dbc-c18b-48c2-94d5-c236510665c9`
- Stripe session: `cs_live_a1sRwfdqrQpuZQkCGnbv922bsAXdKeXHCMYnlvQNHPtXaEgud57jlqMfAu`
- Amount: `3500` cents
- Status: `completed`
- Buyer email: `controlled-merch-test@porterful.com`

## Inventory Event Result

- Order completion reserved inventory through the fulfillment queue RPC.
- Inventory state before smoke test:
  - `on_hand = 99`
  - `reserved = 10`
  - `shipped = 9`
  - `returned = 1`
  - `available = 89`
- Inventory state after smoke test:
  - `on_hand = 99`
  - `reserved = 11`
  - `shipped = 9`
  - `returned = 1`
  - `available = 88`
- Reservation auto-closed behavior remains intact because the queue still uses the verified reserve-to-ship rule.

## Fulfillment Job Result

- Fulfillment job ID: `2dbcbde8-3ff0-4b44-b31b-e30762e260ab`
- Job number: `FQ-CE480D71`
- Status: `reserved`
- Artist ID: `d1a19160-732f-44c4-8040-9cc20fcb9e05`
- Created by: `d1a19160-732f-44c4-8040-9cc20fcb9e05`

## Shipment Event Result

- Shipment event ID: `deea66ae-35eb-4c50-bb37-df2b91bdbae7`
- Event type: `label_created`
- Carrier: `UPS`
- Tracking number: `1ZCONTROLLEDMERCH001`
- Timeline visibility: confirmed in the shipment event ledger

## Artist Visibility Result

- The artist-owned product row is present in production with `seller_id = d1a19160-732f-44c4-8040-9cc20fcb9e05`.
- The fulfillment job is artist-scoped via `artist_id = d1a19160-732f-44c4-8040-9cc20fcb9e05`.
- The controlled product metadata includes the approved asset and SKU linkage, so the artist dashboard can show the product, queue, and shipment timeline without exposing broader merch controls.

## Scope Safety Confirmation

- No full merch builder was created.
- No artist self-service product creation was added.
- No partner fulfillment or distributed routing was added.
- No carrier API integration was added.
- No automatic refunds were added.
- No payout expansion was added.
- No referral expansion was added.
- During the smoke test, merch items were briefly misclassified as music purchases because the webhook accepted empty audio URLs; that logic was corrected, and the stray test music-purchase row was removed from production.

## Remaining Blockers Before Broader Merch Launch

- The current code and live database are ready, but the production storefront still needs the deployed build so `porterful.com` reflects the controlled merch product in the browser.
- No other blockers were found in the controlled merch control plane.
