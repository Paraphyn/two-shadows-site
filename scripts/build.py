#!/usr/bin/env python3
"""Builds the static pages of the Two Shadows site.

Edit the sources, then run `python3 scripts/build.py` from the repo root and
commit both the sources and the generated HTML. Vercel serves the generated
files as they are; there is no build step on Vercel.

  src/layout.html      page skeleton (head, header, footer)
  src/partials/*.html  shared blocks, included with {{> name}}
  src/pages/*.html     one file per page; first line is <!--meta {json}-->
  src/data/faq.json    FAQ, rendered with {{faq}} (all) or {{faq:6}} (first 6)

Page meta keys:
  path         "/" or "/slug" (output: index.html or slug/index.html)
  title, description
  og_type      default "website"
  jsonld       list of: org, website, product, faq, breadcrumb
  crumb        breadcrumb label (default: title before " — ")
  scripts      list of partials appended before </body>
  hero_preload true to preload the hero image
"""
import hashlib
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://two-shadows-site.vercel.app"  # switch to the production domain at launch
SRC = os.path.join(ROOT, "src")

CHEV = ('<svg class="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" '
        'stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>')


def read(*p):
    with open(os.path.join(SRC, *p), encoding="utf-8") as f:
        return f.read()


def text(x):
    return html.unescape(re.sub(r"<[^>]+>", "", x)).strip()


FAQ = json.loads(read("data", "faq.json"))


def render_faq(n=None):
    items = FAQ if n is None else FAQ[:n]
    rows = "".join(f'<details><summary><span>{i["q"]}</span>{CHEV}</summary><p>{i["a"]}</p></details>\n' for i in items)
    return '<div class="acc">\n' + rows + "</div>"


def include(s, depth=0):
    if depth > 5:
        sys.exit("include depth exceeded")

    def rep(m):
        return include(read("partials", m.group(1) + ".html").rstrip("\n"), depth + 1)

    s = re.sub(r"\{\{> ([\w-]+)\}\}", rep, s)
    s = re.sub(r"\{\{faq(?::(\d+))?\}\}", lambda m: render_faq(int(m.group(1)) if m.group(1) else None), s)
    return s


ORG = {
    "@type": "Organization",
    "@id": f"{SITE}/#org",
    "name": "Two Shadows",
    "url": f"{SITE}/",
    "logo": f"{SITE}/brand/two-shadows-stacked-512.png",
    "email": "info@twoshadows.co.uk",
    "areaServed": "GB",
}
WEBSITE = {"@type": "WebSite", "@id": f"{SITE}/#website", "name": "Two Shadows", "url": f"{SITE}/",
           "publisher": {"@id": f"{SITE}/#org"}, "inLanguage": "en-GB"}
PRODUCT = {
    "@type": "Product",
    "@id": f"{SITE}/gut-and-digestion#product",
    "name": "Gut & Digestion soft chews for dogs",
    "description": ("A complementary feed for dogs over 12 weeks: 60 soft chews with Bacillus velezensis DSM 15544, "
                    "a live gut-flora culture, plus prebiotic inulin, psyllium husk and pumpkin and squash seeds, "
                    "designed to support healthy digestion."),
    "brand": {"@type": "Brand", "name": "Two Shadows"},
    "manufacturer": {"@id": f"{SITE}/#org"},
    "image": [f"{SITE}/assets/og-image.jpg", f"{SITE}/assets/photos/ing-chews.webp"],
    "category": "Dog supplements",
    "countryOfOrigin": "GB",
    "weight": {"@type": "QuantitativeValue", "value": 120, "unitCode": "GRM"},
    # availability is left out until stock exists; AggregateRating comes with real reviews
    "offers": {"@type": "Offer", "url": f"{SITE}/gut-and-digestion", "price": "22.99", "priceCurrency": "GBP",
               "itemCondition": "https://schema.org/NewCondition", "seller": {"@id": f"{SITE}/#org"}},
}


def faq_ld():
    # Only final answers: drafts and answers with placeholders stay out of structured data
    q = [{"@type": "Question", "name": text(i["q"]), "acceptedAnswer": {"@type": "Answer", "text": text(i["a"])}}
         for i in FAQ if 'class="draft"' not in i["a"] and 'class="ph"' not in i["a"]]
    return {"@type": "FAQPage", "@id": f"{SITE}/faq#faq", "mainEntity": q}


def build(name):
    raw = read("pages", name)
    m = re.match(r"<!--meta (.*?)-->\n", raw, re.S)
    if not m:
        sys.exit(f"{name}: missing <!--meta {{...}}--> header")
    meta = json.loads(m.group(1))
    body = raw[m.end():].strip("\n")
    path = meta["path"]
    url = SITE + ("/" if path == "/" else path)

    graph = []
    for k in meta.get("jsonld", []):
        if k == "org":
            graph.append(ORG)
        elif k == "website":
            graph.append(WEBSITE)
        elif k == "product":
            graph.append(PRODUCT)
        elif k == "faq":
            graph.append(faq_ld())
        elif k == "breadcrumb":
            label = meta.get("crumb") or meta["title"].split(" — ")[0]
            graph.append({"@type": "BreadcrumbList", "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/"},
                {"@type": "ListItem", "position": 2, "name": label, "item": url}]})
    jsonld = ""
    if graph:
        jsonld = ('<script type="application/ld+json">\n'
                  + json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
                  + "\n</script>")

    preload = ""
    if meta.get("hero_preload"):
        preload = ('<link rel="preload" as="image" type="image/webp" href="/assets/photos/hero.webp" '
                   'imagesrcset="/assets/photos/hero-560.webp 560w, /assets/photos/hero.webp 896w" '
                   'imagesizes="(max-width: 760px) 100vw, 50vw" fetchpriority="high">\n')

    scripts = "\n".join("{{> %s}}" % s for s in meta.get("scripts", []))
    page = read("layout.html")
    # cache-busting: the stylesheet URL changes whenever site.css changes
    with open(os.path.join(ROOT, "assets", "site.css"), "rb") as f:
        css_v = hashlib.sha1(f.read()).hexdigest()[:10]
    page = page.replace('href="/assets/site.css"', f'href="/assets/site.css?v={css_v}"')
    for k, v in {"title": html.escape(meta["title"], quote=True), "description": html.escape(meta["description"], quote=True),
                 "url": url, "site": SITE, "og_type": meta.get("og_type", "website"), "preload": preload,
                 "jsonld": jsonld, "scripts": scripts}.items():
        page = page.replace("{{%s}}" % k, v)
    page = page.replace("{{body}}", body)
    page = include(page)
    # h1_id: promote the heading with this id to <h1> (e.g. the product title on the product page)
    if meta.get("h1_id"):
        page, n = re.subn(r'<h2([^>]*id="%s"[^>]*)>(.*?)</h2>' % re.escape(meta["h1_id"]), r"<h1\1>\2</h1>", page, count=1)
        if not n:
            sys.exit(f"{name}: h1_id {meta['h1_id']} not found")
    # mark the current page in the header and footer navigation
    if path != "/":
        page = re.sub(r'(<a href="%s")(>)' % re.escape(path), r'\1 aria-current="page"\2', page)
    left = re.findall(r"\{\{[^}]*\}\}", page)
    if left:
        sys.exit(f"{name}: unresolved {left}")

    out = os.path.join(ROOT, "index.html") if path == "/" else os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(page)
    return path


if __name__ == "__main__":
    built = [build(n) for n in sorted(os.listdir(os.path.join(SRC, "pages"))) if n.endswith(".html")]
    print("built:", " ".join(built))
