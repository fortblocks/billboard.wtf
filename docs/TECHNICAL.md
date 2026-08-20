# billboard.wtf — Technical Scope

## Recommended Stack (v1)

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + some custom CSS for canvas interactions
- **Grid rendering**: HTML Canvas or React-Konva / PixiJS (decision during scaffolding — Canvas is lighter for this use case)
- **State**: Zustand or React context + URL state for zoom/selection
- **Backend / DB**: Supabase (Postgres + Auth + Storage + Realtime)
- **Payments**: Stripe (Checkout + Webhooks)
- **Hosting**: Vercel
- **Domain**: billboard.wtf (already purchased)

## Core Data Model (simplified)

**Edition**
- id / year (2026)
- status (active / archived)
- config (pricing tiers, crown coordinates, etc.)

**Plot**
- id
- edition_id
- x, y, width, height (in grid coordinates)
- owner_id
- image_url
- title / handle
- story
- primary_url (backlink)
- tags[]
- is_pioneer
- price_paid
- claimed_at
- type: permanent | crown_holder (crown is special)

**CrownState**
- current_plot_id or current_owner + image etc.
- current_bid
- held_since
- history[] (array of previous reigns)

**User**
- id
- email / x_handle
- plots[]

## Key Technical Challenges & Approach

1. **Large grid performance**
   - Never render 2.25M individual DOM nodes
   - Use a single canvas (or layered canvases)
   - Only draw visible viewport + some buffer
   - Image atlas or individual loaded images with culling
   - Level-of-detail: far zoom shows simplified representation

2. **Responsive fitting**
   - Logical 1500×1500 coordinate system
   - Viewport transform (scale + translate)
   - Initial camera position chosen intelligently

3. **Realtime feel**
   - Supabase Realtime for new claims and Crown changes
   - Optimistic UI where safe

4. **Image handling**
   - Upload to Supabase Storage
   - Automatic resizing / optimization
   - Fallback for missing images

5. **Claim integrity**
   - Server-side validation of coordinates (no overlap)
   - Reservation window during checkout (short lock)
   - Idempotent Stripe webhook handling

6. **Pioneer verification**
   - Manual review queue initially, or simple tweet URL + keyword check
   - Can be improved later with X API if needed

## Project Structure (initial)

```
billboard.wtf/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # main grid experience
│   ├── api/
│   │   ├── checkout/
│   │   ├── webhook/
│   │   ├── plots/
│   │   └── crown/
│   └── (other routes)
├── components/
│   ├── Grid/
│   ├── Panel/
│   ├── ClaimFlow/
│   ├── BuilderCard/
│   ├── Crown/
│   └── ui/
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── grid-math.ts
│   └── pricing.ts
├── stores/
├── types/
└── public/
```

## Security & Trust

- All coordinate and ownership changes go through server
- Stripe webhook signature verification
- Rate limiting on claim attempts
- Content moderation path for images and stories (manual initially)
- Clear terms: permanent display promise, acceptable use, no NSFW, etc.

## Future-proofing for Annual Editions

- Every plot belongs to an `edition`
- Routing: billboard.wtf → current, billboard.wtf/2026 → specific
- Archived editions remain fully viewable and linked
