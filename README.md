# Two Shadows — website (direction C)

Static one-page site for Two Shadows Gut & Digestion soft chews. No build step.

- `index.html` — the page
- `assets/site.css` — all styles, incl. tablet and phone layouts
- `assets/photos/` — colour photos (AI-generated placeholders). To add one, put its URL in `assets/photos/sources.json`; the *Fetch photos* GitHub Action downloads it as a web-sized JPG
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `assets/icons/`, `site.webmanifest` — favicon set (TS monogram small, stacked TWO / SHADOWS for 180 px and up)
- `brand/` — stacked logo, 512×512 PNG and outlined SVG
- `vercel.json` — clean URLs, `noindex` header while in review

## Deploy on Vercel
Import this repository in Vercel → Framework preset **Other**, no build command, output directory `.` (root).

## Still placeholders
Prices, delivery threshold, subscription terms, the label shot in the product gallery, and the Short videos section (example images, to be replaced with real customer clips). Benefit wording to be confirmed with the manufacturer.
