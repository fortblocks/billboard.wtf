# billboard.wtf

A digital billboard. One face. Rising price. Hall of Fame.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Flow

1. **Board** — who’s live, current price, world rotation  
2. **Claim** — pay $N (mocked)  
3. **Design** — face only (templates, type, images, stickers)  
4. **Lock** — go live; ladder +$1  
5. **Bump** — retake the top; ladder +$1  
6. **Hall / Map / How**

Data is stored in `localStorage` for this prototype.

## Stack

Next.js App Router · React · Tailwind · no backend yet

## Handover

For full product status, locked geometry, and known issues see **[HANDOVER.md](./HANDOVER.md)**.
