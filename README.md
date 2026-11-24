# Two Shadows — website (direction C)

Static one-page site for Two Shadows Gut & Digestion soft chews. No build step.

- `index.html` — the page
- `assets/site.css` — all styles, incl. tablet and phone layouts
- `assets/photos/` — colour photos as WebP (AI-generated placeholders), plus `-thumb`/`-thumb-120` sizes for the gallery. To add one, put its URL in `assets/photos/sources.json`; the *Fetch photos* GitHub Action downloads it as web-sized WebP
- `assets/fonts/` — self-hosted Anton, Montserrat and IBM Plex Sans Condensed (latin, SIL OFL)
- `assets/og-image.jpg` — 1200×630 social preview
- Structured data (JSON-LD) sits in `<head>`: Organization, Product/Offer, FAQPage. FAQPage only lists answers without drafts or placeholders; add the rest once confirmed. Canonical and og URLs point at the Vercel review URL until launch
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `assets/icons/`, `site.webmanifest` — favicon set (TS monogram small, stacked TWO / SHADOWS for 180 px and up)
- `brand/` — stacked logo, 512×512 PNG and outlined SVG
- `vercel.json` — clean URLs, `noindex` header while in review

## Deploy on Vercel
Import this repository in Vercel → Framework preset **Other**, no build command, output directory `.` (root).

## Still placeholders
Prices, delivery threshold, subscription terms, the label shot in the product gallery, and guarantee and delivery terms, payment marks (text stand-ins), strain survival and per-chew CFU, FAQ answers marked *Draft*. Benefit wording to be confirmed with the manufacturer.
