# Roadmap

## Done

- [x] Pivot from pixel grid → ladder billboard product
- [x] Live board homepage with rotating world scenes + fixed frame
- [x] Ladder state (localStorage): price, claims, bumps, hall
- [x] Claim flow → design studio → lock & go live
- [x] Face-only design tool (text, image, stickers, drag/resize/rotate)
- [x] Platform-owned backgrounds (no user BG control)
- [x] Hall of Fame + map/how scaffolds
- [x] Locked board geometry shared between homepage and studio
- [x] Stronger welcome / default text styling (Impact title, Georgia body, CTA pill)
- [x] Stale localStorage creative isolation (KEY v2 + claim creative:null + per-entry seed)

## In progress / fragile

- [ ] `public/splash/` assets **not in git** — must restore board-frame.png + env-*.jpg
- [ ] White FACE bounds pixel-perfect at bottom (re-verify after assets restored)
- [ ] Studio listing card polish

## Next

- [ ] Restore / commit splash assets
- [ ] Stripe (or similar) for real $N checkout
- [ ] Pioneer apply / tweet-gate
- [ ] Approval queue (moderation)
- [ ] Email / notify on displace (“bump for $X”)
- [ ] More scenes + scene announcements
- [ ] Real visitor analytics on /map
- [ ] Flatten face to WebP server-side for perf

## Later

- [ ] AI assist from URL / logo / Grok brief
- [ ] Muted video on face
- [ ] Annual edition /2027
- [ ] Soft “recent” strip under main face
- [ ] Public design tool showcase on X
