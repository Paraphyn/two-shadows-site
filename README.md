# Two Shadows — Shopify theme

Online Store 2.0 theme (sections + JSON templates) that ports the Two Shadows site 1:1.
The static review site stays on `main` (Vercel); this branch is the Shopify theme.

## Connect to the store
1. Shopify admin → **Online Store → Themes → Add theme → Connect from GitHub**.
2. Pick the `Paraphyn/two-shadows-site` repository and the **`shopify-theme`** branch.
3. The theme appears in the theme library. Click **Customize** to preview; publish only when ready.
   Changes committed to the branch sync to the theme, and edits made in the theme editor are committed back to the branch.

## One-time store setup
- **Product:** create “Gut & Digestion” with the handle `gut-and-digestion`, price £22.99, and upload real photos. Until there are photos, the theme shows the drawn jar and built-in photos.
- **Subscriptions:** install Shopify Subscriptions and add a selling plan to the product. The “Subscribe & save” option then appears with the real price and saving; until then a placeholder row is shown (Product section → “Show subscription placeholder”).
- **Pages:** create pages with these handles and choose the matching template in the page’s *Theme template* field:
  | Page title | Handle | Template |
  |---|---|---|
  | Ingredients & science | `ingredients` | `page.ingredients` |
  | Our story | `about` | `page.about` |
  | FAQ | `faq` | `page.faq` |
  | Contact us | `contact` | `page.contact` |
  | Check your batch | `batch` | `page.batch` |
- **Policies:** Settings → Policies: paste the Privacy, Terms of service, Shipping, Refund and Subscription texts (templates from the review site, after solicitor review). The footer links to them automatically.
- **Menus (optional):** Online Store → Navigation. If no menu is chosen in Header/Footer settings, the default links are used.
- **Theme settings:** contact email, legal line (trading name and address), social links, favicon, sharing image.
- **Placeholders:** every `[…]` in editor text is highlighted. Turn them off in Theme settings → Placeholders before launch.

## Structure
- `layout/theme.liquid`, `layout/password.liquid`
- `sections/` — `ts-*` content sections (hero, product, benefits, inside, story, howto, share, faq, page heading, spec list, feeding guide, cards, heading + text, contact form, batch lookup), header/footer groups, cart drawer, `main-*` sections for cart, 404, search, collection, blog, article, password
- `templates/*.json` — page compositions with all site copy (editable in the theme editor)
- `snippets/` — fonts, meta tags, images with built-in fallbacks, drawn jar, feeding table with the label’s dog silhouettes, `rt` placeholder highlighter
- `assets/` — `ts.css`, `ts.js`, self-hosted fonts (SIL OFL), WebP photos, sharing image

## Checks
`shopify theme check` — no offenses.
