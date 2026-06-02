# Porterful Merch Technical Note

## Current logic
- Merch catalog data lives in [`src/lib/products.ts`](/Users/sentinel/Documents/porterful/src/lib/products.ts); items marked `fulfillment: 'mock'` are preview-only and are not meant to ship yet.
- The Printful adapter in [`src/app/(app)/api/dropship/printful/route.ts`](/Users/sentinel/Documents/porterful/src/app/(app)/api/dropship/printful/route.ts) returns a local demo catalog unless `PRINTFUL_API_KEY` is configured, then proxies product and order calls to Printful.
- The unified fulfillment router in [`src/app/(app)/api/fulfillment/route.ts`](/Users/sentinel/Documents/porterful/src/app/(app)/api/fulfillment/route.ts) splits orders into Printful, Zendrop, or self-fulfilled buckets.

## What in-house fulfillment would require later
- A real SKU/inventory table tied to each merch product.
- Warehouse or printer routing, packing slips, shipping labels, and tracking updates.
- An order-status lifecycle for `queued -> packed -> shipped -> delivered -> returned`.
- Refund, replacement, and partial-fulfillment handling.
- Removal of demo-only branches so every merch order follows one live fulfillment path.
