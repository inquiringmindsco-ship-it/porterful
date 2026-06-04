# PORTERFUL CONTROLLED MERCH STOREFRONT VERIFICATION REPORT

Status: PASS for controlled storefront activation.

## Deployment
- Production alias: `https://porterful.com`
- Current deployment URL: `https://porterful-b2pea8sz2-inquiringmindsco-ship-its-projects.vercel.app`
- Product page URL: `https://porterful.com/product/75006c54-3f40-4309-81a1-a85de8f34841`
- Store page URL: `https://porterful.com/store`

## Product Visibility
- PASS: `Coming Home Tee` is visible in the live storefront.
- PASS: Product details show the product name, artist, price, description, and safe purchase CTA.
- PASS: The product page shows:
  - `Coming Home Tee`
  - `ATM Trap`
  - `$30.00`
  - color `Black`
  - size `L`
  - `Add to Cart — $30.00`
  - `Secure Checkout`
- Note: SKU is not displayed publicly on the product page, which is acceptable for this controlled activation.

## Checkout Verification
- PASS: Cart and checkout totals are correct.
- Store/cart totals observed in browser:
  - Product subtotal: `$30.00`
  - Shipping: `$5.00`
  - Total: `$35.00`
- Checkout review page shows:
  - `Pay $35.00 Securely with Stripe`
  - `Subtotal $30.00`
  - `Shipping $5.00`
  - `Total $35.00`

## Live Controlled Session
- Live checkout session ID: `cs_live_a11yWqwrpK3HunOQFa8V0NEqOn6pfVercP9tB3DRy3bEzXnfLyw2fNT1JM`
- Controlled webhook replay succeeded against the live deployment.

## Order Result
- PASS: Order created for the controlled merch product.
- Order ID: `debf64b7-17ce-4a2e-8129-188ee6bbcf7d`
- Order item ID: `89f2bede-8646-4129-8d57-c29ec3ff57ef`
- Order record:
  - `amount = 3500`
  - `status = completed`
  - `buyer_email = controlled-merch-test@porterful.com`
  - `product_id = 75006c54-3f40-4309-81a1-a85de8f34841`

## Inventory Result
- PASS: Inventory reserve event was created.
- Inventory ledger ID: `3126f78b-3f76-449b-ae6b-551da8554bd5`
- Ledger entry:
  - `movement_type = reserve`
  - `quantity = 1`
  - `sku_id = eb4a802e-e00a-42cf-8e01-ea8ac8a7e773`
  - `reference_type = fulfillment_job`
  - `reference_id = 9afb9b4b-4073-47f5-90e4-a737f6294a72`

## Fulfillment Job Result
- PASS: Fulfillment job was created automatically.
- Fulfillment job ID: `9afb9b4b-4073-47f5-90e4-a737f6294a72`
- Job number: `FQ-6D716B10`
- Job status: `reserved`
- SKU: `COMING-HOME-TEE-001`
- Production asset: `241d0c66-c1aa-4c36-ae33-bad98f31c34a`
- Artist: `ATM Trap` / `d1a19160-732f-44c4-8040-9cc20fcb9e05`

## Shipment Event Result
- PASS: Shipment history can be attached to the fulfillment job.
- Shipment event ID: `127688d5-5e6d-407f-9d01-4968b54419b2`
- Event type: `label_created`
- Carrier: `UPS`
- Tracking number: `1ZCONTROLLEDMERCH002`
- Location: `Austin, TX`
- Notes: `Controlled merch storefront verification`

## Artist / Founder Visibility
- Live dashboard routes for founder and artist fulfillment load, but this browser session is not authenticated, so those pages redirect to login.
- Data-layer verification is complete:
  - the fulfillment job exists
  - the shipment timeline exists
  - the controlled merch row is live
- Remaining UI-only verification, if desired, is signing into founder/artist dashboards in an authenticated session and confirming the live queue row is visible there.

## Scope Safety Confirmation
- PASS: No full merch builder was created.
- PASS: No artist self-service product creation was added.
- PASS: No partner fulfillment was added.
- PASS: No distributed routing was added.
- PASS: No carrier API integration was added.
- PASS: No automatic refunds were added.
- PASS: No payout expansion was added.
- PASS: No referral expansion was added.
- PASS: No stray `music_purchases` row was created for this controlled merch session.
- PASS: Other merch products remain preview-only on the live store.

## Other Merch Products
- Verified in live store:
  - `Signal Shirt` remains preview-only
  - `Gune Classic Tee` remains preview-only

## Build Status
- PASS: `npm run build` completed successfully.
- PASS: Vercel deployment completed successfully and `https://porterful.com` was aliased to the new production deployment.

## Remaining Blockers Before Limited Public Merch Test
- None for the controlled storefront activation itself.
- Optional only: authenticated founder/artist UI verification, if you want to confirm the queue row from a signed-in browser session rather than via the live data path.
