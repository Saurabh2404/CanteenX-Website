# ARDH SAINIK CANTEEN — Kanti

A public website for ARDH SAINIK CANTEEN, Kanti, helping customers explore everyday essentials, discover savings and plan their store visit.

## Customer experience

- Browse Food & Snacks, Beverages, Cooking Essentials, Cleaning Items, Kitchen & Cookware, Personal Care and Daily Items.
- View product names, images, selling prices, MRPs and discounts from the canteen’s POS inventory.
- Discover products with at least 10% off, ordered by net units sold over the last 90 days.
- Explore English and Hindi category labels on a responsive website.
- Find the store location and contact the canteen by phone or WhatsApp.
- Read customer reviews through the live Google integration once connected.

## Product updates

Product details and images are maintained through POS. Public pages are cached and refreshed in the background approximately every minute. Customers receive the last successful page while a refresh is in progress.

Products without an inventory image display a placeholder. Category groupings are currently inferred from product names. The public catalogue is for browsing; availability and final prices should be confirmed with the store. Online ordering and payment are not currently offered.

The website reads inventory information and does not modify POS records or publish customer details, invoices or cost prices.

## Business information

**ARDH SAINIK CANTEEN**  
Ground Floor, SS-Complex, Station Road, opposite Block Gate, Kanti, Muzaffarpur, Bihar 843109.


## Project overview

The website uses Next.js for both pages and API routes, with React, TypeScript, Tailwind CSS, Framer Motion and MongoDB.

| Folder | Purpose |
| --- | --- |
| `frontend/` | Customer-facing pages, design and interface components |
| `backend/` | Server-only catalogue, inventory access and Google reviews logic |
| `automation/` | Live verification and credential checks |
| `reports/` | Generated verification results, excluded from Git |

The local preview runs at **http://localhost:3001**. After private configuration is supplied, the development team can start the website with `npm run dev` and run checks with `npm test`, `npm run verify` and `npm run check:secrets`.
