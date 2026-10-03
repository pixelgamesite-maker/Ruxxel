# Ruxxells

Vite + React + wouter. Supabase for the access list. Static build served by Caddy.

```bash
npm install
cp .env.example .env     # add Supabase keys
npm run dev
```

## Pages

| Route | What |
| --- | --- |
| `/` | Hero, the gate, 4 sectors, the Board, the rest, get on the list |
| `/checkpoint` | The four-step access list form |
| `/gallery` | Every room, with a lightbox |
| `/claim` | FREE claim flow (see below) |

## Design notes

- Colors, spacing and layout were measured from the approved screenshots.
- Headings use **Press Start 2P** with spacing solved from those screenshots
  (`.display` in `src/styles/global.css`). It is the closest match found, not a
  confirmed identical font: the original's T, I and L glyphs are slightly
  narrower. If you learn the real font, change `--display` and the
  `letter-spacing` / `word-spacing` on `.display`; nothing else depends on it.
- Body and labels use JetBrains Mono. Both fonts are bundled (no Google Fonts call).
- Marquee and gallery grid use 512px thumbnails from `public/thumbs/`.
  After changing artwork run `python3 scripts/make-thumbs.py`.

## Before launch

- **Supabase:** run `supabase/schema.sql`. It adds the one-per-wallet index and
  the `access_count()` function that powers the "IN" number.
- **Art:** drop the Holding Bay and Greenhouse images into `public/` as
  `sector-1.jpeg` and `sector-2.jpeg`. Until then those two cards show a
  placeholder. Sectors 03 and 04 use `ruxxells16.jpeg` and `ruxxells6.jpeg`.
- **The Board:** confirm the token addresses in `src/data/board.ts`.
- **OpenSea link:** set `VITE_OPENSEA_URL` once the collection page exists.

## Free claim

`/claim` is built and waiting on a backend. Contract: `docs/CLAIM_API.md`.

- No `VITE_CLAIM_API_URL` and no mock: the page says "Opens with the mint".
- `VITE_CLAIM_MOCK=1`: runs the whole flow in the browser for review.
  `VITE_CLAIM_MOCK_FAST=1` shortens the 3:00 timer to 15s. Add `?window=45`
  to the URL to make the claim window 45 seconds and test the close.
- To show Claim in the top bar, set `SHOW_CLAIM_IN_NAV` in `src/data/site.ts`.
- Wallet connection is injected-wallet only (`src/lib/claim/useWallet.ts`).
  Mobile browsers without a wallet need WalletConnect added in that one file.
