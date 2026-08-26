VAPORIX / PUFF HUB — storefront

This repository contains the current GitHub Pages storefront and admin panel.

Current architecture
- Four-step checkout: contacts → delivery → order review/payment → order status.
- Product flavors are selectable before adding to cart, with quantity control and authoritative per-flavor stock.
- Flavor stock is managed in the admin panel and stored in public.product_flavors.
- The catalog compatibility layer enriches the existing storefront product array with clean flavor names and flavorStocks without rewriting the large legacy index.
- Public checkout uses the Supabase create_public_order RPC. The database validates active products, selected flavors, stock, tier pricing, delivery and payment fee before creating the order.
- Orders are persisted in Supabase and mirrored locally for the customer's profile.
- Customer profile periodically synchronizes order status and payment status from Supabase.
- Admin orders show customer contacts, total, order items, delivery address, order status and payment status.
- Admin can change order and payment statuses directly from dropdowns.

Important
- config.js must contain the active Supabase project URL and publishable key.
- Do not silently fall back to a fake local order if server order creation fails.
- public.product_flavors is authoritative for products that have flavors; products.stock is synchronized by database functions.
- order_items has an admin read policy so the admin order detail view can display line items.

Build: 2026.08.26.4
