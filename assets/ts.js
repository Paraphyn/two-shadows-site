/* Two Shadows theme script. No dependencies. */
(function () {
  'use strict';
  var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  /* Gallery: thumbs, arrows, swipe */
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var slides = g.querySelectorAll('.slide'), thumbs = g.querySelectorAll('.thumb'), i = 0;
    if (!slides.length) return;
    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.hidden = k !== i; s.classList.toggle('is-active', k === i); });
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    thumbs.forEach(function (t) { t.addEventListener('click', function () { show(+t.dataset.go); }); });
    var prev = g.querySelector('.g-prev'), next = g.querySelector('.g-next');
    if (prev) prev.addEventListener('click', function () { show(i - 1); });
    if (next) next.addEventListener('click', function () { show(i + 1); });
    var x0 = null, m = g.querySelector('.gallery-main');
    m.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    m.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var d = e.changedTouches[0].clientX - x0;
      if (Math.abs(d) > 40) show(i + (d < 0 ? 1 : -1));
      x0 = null;
    });
  });

  /* Sticky "Choose & buy" bar: after the product section, hidden at the footer */
  (function () {
    var bar = document.getElementById('stickybuy'), prod = document.getElementById('product'), foot = document.querySelector('.footer');
    if (!bar || !prod || !foot || !('IntersectionObserver' in window)) return;
    var past = false, footVis = false, link = bar.querySelector('a');
    function update() {
      var on = past && !footVis;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      link.tabIndex = on ? 0 : -1;
    }
    new IntersectionObserver(function (e) { var r = e[0]; past = !r.isIntersecting && r.boundingClientRect.top < 0; update(); }).observe(prod);
    new IntersectionObserver(function (e) { footVis = e[0].isIntersecting; update(); }).observe(foot);
  })();

  /* Links to #product: land just under the header (on phones, on the title) */
  (function () {
    var hdr = document.querySelector('.hdr');
    document.querySelectorAll('a[href="#product"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var phone = window.matchMedia('(max-width: 760px)').matches;
        var el = phone ? document.querySelector('.pinfo') : document.getElementById('product');
        if (!el) return;
        e.preventDefault();
        var y = el.getBoundingClientRect().top + window.scrollY - (hdr ? hdr.offsetHeight : 0) - (phone ? 12 : 0);
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', '#product');
      });
    });
  })();

  /* Price on the Add button follows the chosen purchase option / variant */
  (function () {
    var form = document.querySelector('[data-product-form]');
    if (!form) return;
    var price = form.querySelector('[data-add-price]');
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'selling_plan' && t.checked && price) price.textContent = t.dataset.price;
      if (t.matches('[data-variant-select]')) {
        form.querySelector('[data-variant-id]').value = t.value;
        // selling plan prices are per variant: reload with the variant selected so allocations update
        var url = new URL(window.location.href); url.searchParams.set('variant', t.value);
        window.location.href = url.toString();
      }
    });
  })();

  /* Cart drawer */
  var drawer = document.querySelector('[data-cart-drawer]'), lastFocus = null;
  function setCount(n) { document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; }); }
  function openDrawer() {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.hidden = false;
    document.documentElement.classList.add('no-scroll');
    requestAnimationFrame(function () { drawer.classList.add('is-open'); var x = drawer.querySelector('.drawer-x'); if (x) x.focus(); });
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    setTimeout(function () { drawer.hidden = true; }, 200);
    if (lastFocus) lastFocus.focus();
  }
  function renderDrawer(html) {
    if (!drawer || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('[data-cart-drawer] .drawer-panel');
    if (fresh) drawer.querySelector('.drawer-panel').replaceWith(fresh);
  }
  function refreshCount() {
    return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }).then(function (c) { setCount(c.item_count); });
  }
  if (drawer) {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-cart-open]')) { e.preventDefault(); openDrawer(); return; }
      if (e.target.closest('[data-cart-close]')) { closeDrawer(); return; }
      var q = e.target.closest('[data-qty]');
      if (q) {
        q.disabled = true;
        fetch(root + 'cart/change.js', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: q.dataset.qty, quantity: Math.max(0, +q.dataset.q), sections: 'cart-drawer' })
        }).then(function (r) { return r.json(); }).then(function (c) {
          setCount(c.item_count);
          renderDrawer(c.sections && c.sections['cart-drawer']);
        }).catch(function () { q.disabled = false; });
      }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
  }

  /* Add to bag without leaving the page */
  document.querySelectorAll('[data-product-form]').forEach(function (form) {
    var btn = form.querySelector('[data-add]'), msg = form.querySelector('[data-form-msg]');
    form.addEventListener('submit', function (e) {
      if (!drawer || !window.fetch) return; // fall back to the normal form post
      e.preventDefault();
      var fd = new FormData(form);
      if (!fd.get('selling_plan')) fd.delete('selling_plan'); // one-time purchase
      fd.append('sections', 'cart-drawer');
      btn.disabled = true; btn.setAttribute('aria-busy', 'true'); if (msg) msg.textContent = '';
      fetch(root + 'cart/add.js', { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (!res.ok) { if (msg) msg.textContent = res.j.description || res.j.message || 'Could not add to bag.'; return; }
          renderDrawer(res.j.sections && res.j.sections['cart-drawer']);
          return refreshCount().then(openDrawer);
        })
        .catch(function () { form.submit(); })
        .finally(function () { btn.disabled = false; btn.removeAttribute('aria-busy'); });
    });
  });

  /* Check your batch: looks up the batch list rendered by the section */
  (function () {
    var form = document.getElementById('batch-form'); if (!form) return;
    var input = document.getElementById('batch-no'), out = document.getElementById('batch-result');
    var data = {}; try { data = JSON.parse(document.getElementById('batch-data').textContent); } catch (err) { data = {}; }
    var email = form.dataset.email || '';
    function card(title, body, link) {
      var c = document.createElement('div'); c.className = 'card';
      var h = document.createElement('h3'); h.textContent = title; c.appendChild(h);
      var p = document.createElement('p'); p.textContent = body; c.appendChild(p);
      if (link) { var a = document.createElement('a'); a.className = link.cls || 'tlink'; a.href = link.href; a.textContent = link.text; if (link.blank) { a.target = '_blank'; a.rel = 'noopener'; } c.appendChild(a); }
      out.replaceChildren(c);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = input.value.toUpperCase().replace(/\s+/g, '');
      if (!code) { card('Enter a batch number', 'You’ll find it printed on your jar.'); input.focus(); return; }
      var pdf = Object.prototype.hasOwnProperty.call(data, code) ? data[code] : null;
      if (pdf) card('Batch ' + code, 'The certificate of analysis for this batch is ready.', { href: pdf, text: 'Open certificate (PDF)', cls: 'btn', blank: true });
      else card('We couldn’t find batch ' + code, 'Check the number on your jar and try again. If it still doesn’t show, email us the batch number and we’ll send the certificate.', { href: 'mailto:' + email + '?subject=' + encodeURIComponent('Certificate for batch ' + code), text: 'Email us' });
    });
  })();
})();

/* Mobile hero: size the photo so the main button fits on the first screen */
(function () {
  var img = document.querySelector('.hero-img'), cta = document.querySelector('.hero-cta .btn') || document.querySelector('.hero-cta');
  if (!img || !cta) return;
  var mq = window.matchMedia('(max-width: 760px)'), lastW = 0;
  function fit() {
    if (!mq.matches) { img.style.height = ''; return; }
    img.style.height = '';
    var r = img.getBoundingClientRect(), imgTop = r.top + window.scrollY;
    var textToCta = cta.getBoundingClientRect().bottom - r.bottom;
    var avail = window.innerHeight - imgTop - textToCta - 20;
    img.style.height = Math.round(Math.max(110, Math.min(avail, r.width * 1.1))) + 'px';
  }
  fit();
  window.addEventListener('load', fit);
  window.addEventListener('resize', function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; fit(); } });
  lastW = window.innerWidth;
})();

/* Mobile product: size the jar so the options and buy button fit on the first screen */
(function () {
  var main = document.querySelector('#product .gallery-main'), add = document.querySelector('#product .add');
  if (!main || !add) return;
  var mq = window.matchMedia('(max-width: 760px)'), lastW = window.innerWidth;
  function fit() {
    var jar0 = main.querySelector('.jar');
    main.style.height = ''; if (jar0) jar0.style.transform = '';
    if (!mq.matches) return;
    var r = main.getBoundingClientRect(), top = r.top + window.scrollY;
    var rest = add.getBoundingClientRect().bottom - r.bottom;
    var avail = window.innerHeight - top - rest - 16;
    var h = top > window.innerHeight * 0.5 ? Math.round(r.width) : Math.round(Math.max(140, Math.min(avail, r.width)));
    main.style.height = h + 'px';
    var jar = main.querySelector('.jar');
    if (jar) jar.style.transform = 'scale(' + Math.min(1.05, (h - 20) / jar.offsetHeight).toFixed(3) + ')';
  }
  fit();
  window.addEventListener('load', fit);
  window.addEventListener('resize', function () { if (window.innerWidth !== lastW) { lastW = window.innerWidth; fit(); } });
})();
