# billboard.wtf — Product

## One-liner

A literal digital billboard. One brand on the face at a time. Price starts at $1 and climbs $1 per claim or bump. You design the face; we rotate the world behind it.

## Core loop

1. Board shows current top creative on a rotating world scene.
2. Public price: **Board is at $N**.
3. Claim for $N → design studio (face only) → lock → go live → price becomes $N+1.
4. Displaced brands can **bump** (pay current − original) to retake the face; bump also +$1.
5. Everything lands in the **Hall of Fame** (numbered, dated, linked).
6. **Map** shows visitors + board locations (platform-owned scenes).

## What advertisers control

- Content **inside** the fixed-size board face: text, images, stickers (video later).
- **Not** backgrounds. Worlds are an ever-growing series we publish.

## What is locked visually

- Board width: `min(96vw, 1700px)`
- Board vertical offset: `translateY(120px)`
- Frame asset: `/splash/board-frame.png`
- Editable region: white face only (`FACE` in `boardGeometry.ts`)

See **HANDOVER.md** for exact constants and studio acceptance criteria.

## Pioneers

Free early slots (tweet/apply). Separate from the paid ladder. Numbered in the Hall.

## Surfaces

| Route | Role |
|-------|------|
| `/` | Live board + price + claim CTA |
| `/claim` | Pay $N (mocked) → design |
| `/design/[id]` | Face design studio |
| `/hall` | Chronicle + metrics |
| `/map` | Visitors + board locations |
| `/how` | Rules |

## Revenue

After \(n\) paid actions (claims + bumps): ~\(n(n+1)/2\), plus future exclusives / design upsells.

## Domain

billboard.wtf — owned.
