> **Note (2026-08-22):** Large parts of this doc describe the abandoned **pixel-grid** architecture. Current product is the **ladder billboard**. Prefer `HANDOVER.md` and `docs/PRODUCT.md` for architecture. Stack choice (Next.js + Tailwind) remains valid; Supabase/Stripe still planned.

# billboard.wtf — Technical Scope

## Recommended Stack (v1)

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + some custom CSS for canvas interactions
- **State**: localStorage prototype now; Zustand or React context later
- **Backend / DB**: Supabase (Postgres + Auth + Storage + Realtime) — planned
- **Payments**: Stripe (Checkout + Webhooks) — planned
- **Hosting**: Vercel
- **Domain**: billboard.wtf (already purchased)

## Current architecture (ladder)

- Shared geometry: `src/lib/boardGeometry.ts` (BOARD_WIDTH, BOARD_OFFSET_Y, FACE)
- Live board: `src/components/board/LiveBoard.tsx`
- Design studio: `src/components/design/DesignStudio.tsx`
- Store: `src/lib/store.ts` (localStorage ladder)
- Types: `src/lib/types.ts`

## Planned data model (post-prototype)

**Entry** — brand, url, amounts, creative (flat face image + layer JSON), status, hall number  
**Ladder** — currentPrice, liveEntryId, totalRaised  
**Scene** — platform world backgrounds

## Security & Trust

- All ownership changes eventually server-side
- Stripe webhook signature verification
- Content moderation path for face creatives
- Clear terms: permanent display promise, acceptable use

## Future-proofing for Annual Editions

- Routing: billboard.wtf → current, billboard.wtf/2026 → specific
- Archived editions remain fully viewable
