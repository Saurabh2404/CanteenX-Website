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

The website uses the same product database as the canteen’s POS application. Product details and images are maintained through POS. Public pages are cached and refreshed in the background approximately every minute. Customers receive the last successful page while a refresh is in progress.

Products without an inventory image display a placeholder. Category groupings are currently inferred from product names. The public catalogue is for browsing; availability and final prices should be confirmed with the store. Online ordering and payment are not currently offered.

The website reads inventory information and does not modify POS records or publish customer details, invoices or cost prices.

## Business information

**ARDH SAINIK CANTEEN**  
Ground Floor, SS-Complex, Station Road, opposite Block Gate, Kanti, Muzaffarpur, Bihar 843109.



## Before public launch

- Confirm opening hours and all business information.
- Connect the live Google reviews service using privately supplied credentials.
- Provide the official Facebook and Instagram profile links.
- Confirm any offers, events and announcements before publishing them.
- Connect the public domain and submit the website sitemap to Google Search Console. Google controls search indexing and ranking.

Google reviews are currently awaiting the API connection. No sample reviews are presented as customer feedback. Google may return fewer reviews than are visible on the full business listing.

## Project overview

The website uses Next.js for both pages and API routes, with React, TypeScript, Tailwind CSS, Framer Motion and MongoDB.

| Folder | Purpose |
| --- | --- |
| `frontend/` | Customer-facing pages, design and interface components |
| `backend/` | Server-only catalogue, inventory access and Google reviews logic |
| `automation/` | Live verification and credential checks |
| `reports/` | Generated verification results, excluded from Git |

The local preview runs at **http://localhost:3001**. After private configuration is supplied, the development team can start the website with `npm run dev` and run checks with `npm test`, `npm run verify` and `npm run check:secrets`.

## Confidential configuration

Passwords, database connection strings, API keys and other secrets must stay in private environment configuration. They must never be added to this README, source files, screenshots or Git commits. Public business contact information is included above for customer use.

## Hosting

Import the GitHub repository into Vercel with **Root Directory: `frontend`** and **Framework: Next.js**. Include files outside the root directory so the server-only backend workspace is available. Use Node.js 22 and the default Next.js output directory.

Configure `MONGO_URI` privately in Vercel environment settings. Google reviews additionally require `GOOGLE_PLACES_API_KEY` and `GOOGLE_PLACE_ID`. Do not upload local `.env` files or commit credentials. Local development reads the ignored `frontend/.env` file.

Pages and `/api` endpoints deploy together. No separate backend host or port 5001 is required. Run `npm run dev` from the repository root to start everything locally on port 3001.

The homepage hero uses one compressed collage stored in the website-only `website_assets` database collection. Original POS product images remain unchanged. Run `npm run hero:build` after changing the desired hero inventory imagery to regenerate it. Product photos are included as encoded image data in cached public pages, so ordinary page views do not open a database connection for each photo. The hero is also read from the database and embedded as one image. No product image files or catalogue exports are committed to the repository.
