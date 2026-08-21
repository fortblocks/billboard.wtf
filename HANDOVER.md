# HANDOVER.md — billboard.wtf

> **Purpose:** Hand this file to a new chat/agent so work continues without re-deriving product decisions, geometry, or known bugs. Read this first, then `docs/PRODUCT.md`, then the code paths listed under “Source of truth”.

**Domain:** billboard.wtf (owned)  
**Repo:** `fortblocks/billboard.wtf` (main)  
**Stack:** Next.js App Router · TypeScript · Tailwind · localStorage prototype (no real payments yet)  
**Run:** `npm install && npm run dev` → http://localhost:3000

---

## 1. What the product is (current pivot)

**Not** the original “million dollar homepage” pixel grid. That idea was abandoned mid-build.

**Current product:** a **literal digital billboard**.

- One brand on the **white face** at a time.
- Price starts at **$1** and climbs **+$1** per claim or bump (ladder: after n paid actions ≈ n(n+1)/2 revenue).
- User designs **only the white advertising face**. Backgrounds/worlds are **platform-owned** and rotate.
- Previous live brands go to **Hall of Fame**; they can **bump** (pay current − original) to retake the face.
- Pioneer free slots planned (tweet-gate); not fully wired.

### Routes

| Route | Role |
|-------|------|
| `/` | Live board: rotating world scenes + fixed board frame + live creative on face |
| `/claim` | Claim at current $N (mocked localStorage) → redirect to design |
| `/design/[id]` | Face design studio (same board placement as homepage) |
| `/hall` | Hall of Fame chronicle |
| `/map` | Visitor / scene map scaffold |
| `/how` | Rules / how it works |

### Core user loop

1. See live board on homepage (world rotates behind fixed frame).
2. Claim → pay $N (mocked) → `/design/[id]`.
3. Design inside **white face only** → Lock & go live.
4. Ladder +$1; previous live → hall; new creative on face.
5. Bump to retake (pay difference).

---

## 2. LOCKED visual decisions (do not regress)

User was explicit: **do not change board size/placement once locked.**

### Board chrome (homepage + studio)

```ts
// src/lib/boardGeometry.ts
BOARD_WIDTH = "min(96vw, 1700px)"
BOARD_OFFSET_Y = 120   // translateY — tucks pillar under footer; LOCKED
```

- Board container: `width: BOARD_WIDTH`, `transform: translateY(BOARD_OFFSET_Y)`.
- Frame image: `/splash/board-frame.png` — **in-flow** `block h-auto w-full` (not absolute; not aspect-ratio shrink).
- Placement: parent `flex items-end justify-center` so board sits bottom-aligned then shifted down 120px.
- **Same structure on homepage (`LiveBoard`) and design studio (`DesignStudio`).**

### White face (editable region)

```ts
FACE = {
  left: "1.8%",
  top: "2.8%",
  right: "1.8%",
  bottom: "38.5%",
}
```

- Percentages of the **board-frame.png** box (994×571).
- Uses **top/bottom/left/right** (not width/height) so scale is stable.
- Pure white band in PNG ≈ top 3.2% → bottom 59.7%; FACE is slightly expanded into the inner silver lip so drag reaches the visual canvas edge.
- All design layers live **inside** a face div with `overflow: hidden`.
- Drag is free; content past the face is clipped (goes “behind” the frame).
- Export / lock rasterizes **only the face** to a flat image for the live board.

### Assets (critical)

| Path | Role |
|------|------|
| `public/splash/board-frame.png` | Transparent frame + pillar overlay (face is empty white in the middle) |
| `public/splash/env-*.jpg` | World backgrounds **without** a board in the middle (arctic, desert, newyork) |
| Other jpgs in `public/splash/` | Older/full composites — prefer `env-*` for rotation |

Homepage: backgrounds crossfade; board-frame sits fixed on top; creative renders in FACE.

---

## 3. Design studio — intended behaviour

**File:** `src/components/design/DesignStudio.tsx`

### Should work

- Board identical placement/size to homepage.
- Editable region = white face only (`FACE` + `overflow: hidden`).
- Layers: text, image (upload), sticker (emoji set).
- Drag, resize handle, rotation (toolbar).
- Center **+** opens Text / Image / Sticker.
- Listing card under **left** of board: Name, URL, @handle, Share on X, Save draft, Lock & go live.
- On lock: rasterize face → flat image layer → `lockAndPublish` → `/`.
- Welcome seed copy (3 text layers) when canvas empty — treated as hints so + still shows.

### Known / open issues (user feedback, not fully resolved)

1. **Bottom clip of layers** — User repeatedly reported layers still cut off before the visual bottom of the white. Geometry was re-probed in a static HTML overlay (`public/face-test.html`) and expanded; **verify again after pull**. If still wrong, compare `getBoundingClientRect()` of face vs the white pixels of the rendered img — possible parent `overflow: hidden` + `translateY(120px)` interaction on some viewports.
2. **Welcome title sometimes missing / weak hierarchy** — Seed is three layers (Georgia title, body, CTA). Screenshot showed title missing once — check seed effect + `entry.creative` restore from localStorage (old drafts can override seed).
3. **Typography still “dull”** — Needs stronger default text styling, better fonts, clearer hierarchy; user asked for text boxes to be “visually strong in their own right.”
4. **Plus vertical position** — Should be true center of **white face** (50%/50% of FACE). If face bounds wrong, plus looks high.
5. **Controls polish** — Listing card improved but user still wants better layout.
6. **Video** — Mentioned in product vision; not implemented on face yet.
7. **localStorage SecurityError** — Seen in some contexts (iframes / blocked storage); store has partial fallbacks; claim flow must stay resilient.

### Design studio UX rules (from user)

- No user-controlled backgrounds in the editor.
- Black stage around the board.
- White face = only place content can appear.
- Final output = single flat image fitted to face; click-through to brand URL on homepage.
- Name / URL / X under left of board on studio; on live board, brand attribution as designed on homepage.

---

## 4. Data & state

**File:** `src/lib/store.ts` — localStorage key for ladder state.

```ts
LadderState {
  currentPrice: number;      // next claim price
  liveEntryId: string | null;
  entries: BoardEntry[];
  totalRaised: number;
}
```

`BoardEntry`: id, number, kind (pioneer|claim|bump), brand, url, amounts, creative, status (draft|locked|approved|live|hall), timestamps.

**No backend yet.** Payments mocked. Stripe is next for real money.

Types: `src/lib/types.ts`  
Ladder helpers: `src/lib/ladder.ts`  
Scenes list: `src/lib/scenes.ts`

---

## 5. Source of truth (code map)

| Concern | File |
|---------|------|
| Board width / offset / FACE | `src/lib/boardGeometry.ts` |
| Homepage live board | `src/components/board/LiveBoard.tsx` |
| Face creative render | `src/components/board/FaceCreative.tsx` |
| Design studio | `src/components/design/DesignStudio.tsx` |
| Rasterize / fonts / stickers | `src/components/design/studioHelpers.ts` |
| Claim page | `src/app/claim/page.tsx` |
| Design page shell | `src/app/design/[id]/page.tsx` |
| Homepage | `src/app/page.tsx` |
| Nav | `src/components/board/SiteNav.tsx` |
| Store | `src/lib/store.ts` |

**Legacy / mostly unused from pixel-grid era:** `GridCanvas`, `BillboardStage`, `SlidingPanel`, parts of `docs/TECHNICAL.md` that still describe plots/crowns. Prefer ladder product docs.

---

## 6. Product decisions log (high signal)

- Domain: **billboard.wtf** confirmed.
- Model: ladder pricing ($1, $2, $3…), bump pays difference, live = top of ladder.
- Annual editions idea: `billboard.wtf/2026` etc. if it takes off.
- Backgrounds: platform series (world tour metaphor); map of visitors later.
- No rental model (dropped when annual vision landed).
- Design tool should feel gamey / minimal / powerful — not a generic Canva clone.
- Mobile: landscape consideration discussed; not finalized.
- Public design tool / share best posters on X — logged idea.

---

## 7. What “done” looks like for the studio (acceptance)

When these pass, studio geometry/UX is “done” enough to move on:

- [ ] Board size and vertical position match homepage (locked constants).
- [ ] Face outline matches white canvas including bottom edge (drag reaches silver lip, then clips).
- [ ] No content paints outside white; overflow clips cleanly.
- [ ] Plus is centered in white face.
- [ ] Welcome / empty state is typographically strong and fully inside white.
- [ ] Text / image / sticker add, drag, resize, rotate, delete work.
- [ ] Lock exports flat face image and shows on homepage.
- [ ] Listing fields persist with entry.

---

## 8. Immediate next steps (suggested for new chat)

1. **Verify FACE bottom** after pull: new claim → add a solid rectangle layer → drag to bottom of white → confirm clip line == bottom of white (not 15px early). If still early, debug with temporary `outline: 1px solid red` on face and compare to img.
2. **Typography pass** on welcome + default text layer styles (sizes, weights, fonts).
3. **Hardening:** clear stale `creative` on new claim so old post-it/welcome state cannot load.
4. Then: Stripe scaffold, pioneer flow, moderation, more scenes.

---

## 9. How to start the next chat

Paste something like:

> Continue billboard.wtf from HANDOVER.md in the repo. Product is the ladder billboard (not pixel grid). Board geometry is LOCKED in `src/lib/boardGeometry.ts`. Priority: (1) confirm white FACE bottom clip is fixed in DesignStudio, (2) stronger welcome/text styling, (3) then payments. Do not change BOARD_WIDTH or BOARD_OFFSET_Y.

---

## 10. Docs index

| Doc | Notes |
|-----|--------|
| `HANDOVER.md` | This file — status + locked decisions |
| `docs/PRODUCT.md` | Product narrative (keep aligned with ladder) |
| `docs/ROADMAP.md` | Done / next |
| `docs/TECHNICAL.md` | Partially outdated (pixel-grid era) — do not treat as current architecture |
| `docs/UX.md` | UX notes |
| `README.md` | Quick start |

*Last updated: 2026-08-22 for chat handover after design-studio geometry iteration.*
