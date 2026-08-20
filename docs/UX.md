# billboard.wtf — UX Specification

## Design Philosophy

- **Grid-first**: The live board is the landing page. No traditional marketing homepage in front of it.
- **Interface gets out of the way**: Controls live in a sliding panel that can be completely hidden.
- **Exemplary interaction quality**: Smooth zoom/pan, satisfying feedback, delightful micro-copy, polished empty and loading states.
- **Storytelling over utility**: Every claim should feel like adding a page to a collective yearbook.
- **Mobile and desktop equal citizens**.

## Overall Layout

```
┌────────────────────────────────────────────────────────────────┐
│  [Minimal top bar – logo + panel toggle + account]      │
├────────────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                   LIVE GRID (full area)                 │
│              (responsive, zoomable, pannable)           │
│                                                         │
│                                                         │
├────────────────────────────────────────────────────────────────┤
│  Optional thin bottom activity ticker (live claims)     │
└────────────────────────────────────────────────────────────────┘

Sliding Panel (right on desktop, bottom sheet on mobile)
```

- Grid always fills the available viewport.
- Initial view is framed intelligently (slightly zoomed to show interesting density or the Crown).
- Panel can be toggled with a clear handle / button / keyboard shortcut.

## Grid Interaction

- **Zoom**: Continuous, smooth (mouse wheel, pinch, +/- buttons). Hard minimum zoom = 10×10 block size.
- **Pan**: Drag or trackpad.
- **Hover** (desktop):
  - Empty space → subtle highlight + price preview
  - Owned plot → mini card preview (image + handle)
  - Crown → special glow + current holder teaser
- **Click / Tap**:
  - Empty → opens claim flow in panel
  - Owned → opens full Builder Card in panel
  - Crown → opens Crown view in panel
- **Selection**: Drag to select a rectangular empty area for multi-block purchase (live price updates).

Visual hierarchy:
- Permanent owned plots show their image.
- Empty space has a clean, slightly textured or dotted background.
- Crown has a distinct, premium treatment (border, subtle animation, crown indicator).

## Sliding Panel – Content & Structure

The panel has clear sections / tabs:

### 1. Explore (default)
- Search input (handle, domain, tags, free text)
- Filter chips: Pioneers, Recently claimed, High activity, Tags, etc.
- “Trending zones” or highlighted areas
- Quick stats (plots claimed, % filled, current Crown holder)

### 2. Purpose / About (always accessible)
Short, strong copy about the permanent visual record of the builders of 2026, backlinks, storytelling, and The Crown.

### 3. Deals / Early Access
- Remaining Pioneer slots counter + claim CTA
- Current early-bird pricing tier
- Flash discounts or highlighted under-priced plots

### 4. My Board (authenticated)
- Your claimed plots
- Quick edit
- Crown alerts
- Share buttons

### 5. Contextual views
- Claim flow
- Builder Card
- Crown view

## Purchase / Claim Flow (Permanent Plots)

Triggered by selecting empty space.

**Step 1 – Selection confirmation**
- Visual highlight of the exact area
- Live calculation: pixels × current price tier
- Total price
- “This will be permanent” messaging

**Step 2 – Customize**
- Upload image
- Display name / handle
- Short story / bio
- Primary link (required)
- Optional tags

**Step 3 – Account / Payment**
- Email or social login
- Stripe checkout

**Step 4 – Success**
- Instant placement on the grid
- Shareable card
- Prompt to tweet

## Pioneer Claim Flow

Special path requiring a public X post, then free customization + Pioneer badge.

## Crown Flow

Current holder prominent, Take the Crown CTA, swipeable / list history of previous reigns.

## Builder Card

Full view with image, story, tags, primary backlink, coordinates, claim date, share.

## Responsive Behaviour

- Desktop: panel slides from right
- Mobile: panel becomes bottom sheet
- Touch targets generous

## Empty, Loading & Edge States

- Elegant framing on first load
- Inviting prompt when board is empty
- Scarcity messaging when almost full
- Graceful network degradation

## Accessibility & Quality Bar

- Keyboard navigable where reasonable
- Sufficient contrast
- Reduced motion support
- Fast perceived performance
- Delightful but never slow or gimmicky
