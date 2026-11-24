# Two Shadows — website (direction C)

Static site for Two Shadows Gut & Digestion soft chews: a landing page plus product, content and legal pages.

## Editing pages
Pages are generated from sources in `src/` by a small Python script (standard library only). Vercel does not build anything; it serves the generated HTML as committed.

1. Edit `src/layout.html`, `src/partials/*.html`, `src/pages/*.html` or `src/data/faq.json`.
2. Run `python3 scripts/build.py` from the repo root.
3. Commit the sources and the generated files together.

Do not edit the generated `index.html` or `*/index.html` by hand; they are overwritten on the next build. How the templates work is described at the top of `scripts/build.py`.

| URL | Source |
|---|---|
| `/` | `src/pages/home.html` (landing; shows the first 6 FAQs) |
| `/gut-and-digestion` | product page (Product JSON-LD) |
| `/ingredients` | ingredients, strain, full composition, feeding guide |
| `/about` | story, founders placeholder |
| `/faq` | all 17 FAQs (FAQPage JSON-LD, final answers only) |
| `/contact` | email, WhatsApp and address placeholders |
| `/batch` | batch lookup; certificates are listed in `assets/coa/batches.json` |
| `/privacy`, `/terms`, `/delivery-returns`, `/subscription-terms` | legal templates, to be reviewed by a solicitor |

## Files
- `assets/site.css` — all styles, incl. tablet and phone layouts. `--rose-text` is the AA-safe rose for small text; `--rose` stays for icons, borders and large type
- `assets/photos/` — colour photos as WebP (AI-generated placeholders), plus `-thumb`/`-thumb-120` sizes for the gallery. To add one, put its URL in `assets/photos/sources.json`; the *Fetch photos* GitHub Action downloads it as web-sized WebP
- `assets/fonts/` — self-hosted Anton, Montserrat and IBM Plex Sans Condensed (latin, SIL OFL)
- `assets/coa/` — certificates of analysis: add the PDF and an entry in `batches.json`
- `assets/og-image.jpg` — 1200×630 social preview
- `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `assets/icons/`, `site.webmanifest` — favicon set
- `brand/` — stacked logo, 512×512 PNG and outlined SVG
- `vercel.json` — clean URLs, `noindex` header while in review, cache headers

Canonical and og URLs use `SITE` in `scripts/build.py` (the Vercel review URL until launch).

## Deploy on Vercel
Framework preset **Other**, no build command, output directory `.` (root). Pushing to `main` deploys.

## Still placeholders
Trading name surname and address, delivery and subscription figures, guarantee terms, payment marks (text stand-ins), strain survival and per-chew CFU, FAQ answers marked *Draft*, WhatsApp, founders, certificates of analysis, ICO number and VAT status. Benefit wording to be confirmed with the manufacturer. Legal pages are templates for solicitor review.
