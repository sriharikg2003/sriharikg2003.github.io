/* ============================================================
   main.js — behavior layer.
   Reads everything from SITE_DATA (js/data.js) and renders it.
   Modules: theme, nav, typed tagline, renderers, filters,
   lightbox, scroll reveal, contact form.
   ============================================================ */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==================== THEME TOGGLE ==================== */
  // Initial theme is applied in <head> before paint; this just toggles + persists.
  const themeMeta = $('meta[name="theme-color"]');

  function applyThemeColor() {
    themeMeta.content = document.documentElement.dataset.theme === 'dark' ? '#0b0e14' : '#f8f9fc';
  }

  $('#theme-toggle').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    applyThemeColor();
  });
  applyThemeColor();

  /* ==================== MOBILE NAV ==================== */
  const navToggle = $('.nav__toggle');
  const navMenu = $('#nav-menu');

  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // close menu when a link is clicked (mobile)
  navMenu.addEventListener('click', (e) => {
    if (e.target.matches('.nav__link')) {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* active link highlighting while scrolling */
  const sections = ['news', 'experience', 'publications'];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$('.nav__link').forEach((a) =>
        a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((id) => { const el = document.getElementById(id); if (el) sectionObserver.observe(el); });

  /* ==================== TYPEWRITER TAGLINE ==================== */
  // Types the single hero tagline once, then a blinking caret remains.
  const typedEl = $('#typed');
  if (typedEl) {
    const phrase = SITE_DATA.tagline || '';
    if (prefersReducedMotion) {
      typedEl.textContent = phrase;
    } else {
      let ci = 0;
      (function tick() {
        ci += 1;
        typedEl.textContent = phrase.slice(0, ci);
        if (ci < phrase.length) setTimeout(tick, 70);
      })();
    }
  }

  /* ==================== RENDER: ABOUT ==================== */
  if ($('#bio')) {
    $('#bio').innerHTML = SITE_DATA.bio;
  }

  /* ==================== RENDER: NEWS ==================== */
  const newsList = $('#news-list');
  if (newsList) {
    newsList.innerHTML = (SITE_DATA.news || [])
      .map(
        (n) => `
      <li class="news__item reveal">
        <span class="news__date">[${n.date}]</span>
        <span class="news__text">${n.text}</span>
      </li>`,
      )
      .join('');
  }

  /* ==================== RENDER: PUBLICATIONS ==================== */
  const pubList = $('#publications-list');
  if (pubList) {
    const pubs = SITE_DATA.publications || [];
    const years = [...new Set(pubs.map((p) => p.year))].sort((a, b) => String(b).localeCompare(String(a)));

    const renderAuthors = (authors) =>
      authors.map((a) => (a === 'Srihari K G' ? `<span class="pub__me">${a}</span>` : a)).join(', ');

    const renderLinks = (links = {}) => {
      const defs = [
        ['project', 'Project Page'],
        ['paper', 'Paper'],
        ['code', 'Code'],
      ];
      return `<div class="pub__links">${defs
        .map(([key, label]) =>
          links[key]
            ? `<a class="pub__btn" href="${links[key]}" target="_blank" rel="noopener">${label} ↗</a>`
            : `<span class="pub__btn is-soon" aria-disabled="true" title="Coming soon">${label} · soon</span>`,
        )
        .join('')}</div>`;
    };

    pubList.innerHTML = years
      .map(
        (year) => `
      <div class="pub-year-group">
        <h3 class="pub-year reveal">${year}</h3>
        ${pubs
          .filter((p) => p.year === year)
          .map(
            (p, i) => `
          <article class="pub reveal">
            ${
              p.image
                ? `<button class="pub__thumb" type="button" data-pub="${i}" aria-label="View teaser figure for ${p.title}">
                     <img src="${p.image}" alt="${p.title} — teaser figure" loading="lazy" width="320" height="160" />
                   </button>`
                : ''
            }
            <div class="pub__body">
              <h4 class="pub__title">${p.title}</h4>
              <p class="pub__authors">${renderAuthors(p.authors)}</p>
              <p class="pub__venue"><span class="pub__badge">${p.venue}</span></p>
              ${renderLinks(p.links)}
            </div>
          </article>`,
          )
          .join('')}
      </div>`,
      )
      .join('');

    // Clicking a teaser opens it in the lightbox.
    pubList.addEventListener('click', (e) => {
      const btn = e.target.closest('.pub__thumb');
      if (!btn) return;
      const p = pubs[+btn.dataset.pub];
      lbOpen({ title: p.title, description: p.authors.join(', '), images: [p.image] });
    });
  }

  /* ==================== RENDER: PROJECTS ==================== */
  const grid = $('#projects-grid');
  const filtersWrap = $('#filters');

  if (grid) {
  grid.innerHTML = SITE_DATA.projects.map((p, i) => `
    <li class="project-card reveal" data-index="${i}" data-tags="${p.tags.join('|')}" tabindex="0"
        role="button" aria-label="Open details for ${p.title}">
      <div class="project-card__media">
        <img src="${p.images[0]}" alt="${p.title} preview" loading="lazy" width="640" height="400" />
        <div class="project-card__overlay" aria-hidden="true"><span>View Details</span></div>
      </div>
      <div class="project-card__body">
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__desc">${p.description}</p>
        <div class="project-card__tags">${p.tags.map((t) => `<span>${t}</span>`).join('')}</div>
      </div>
    </li>
  `).join('');

  /* ==================== FILTERS ==================== */
  filtersWrap.innerHTML = SITE_DATA.categories.map((c, i) => `
    <button class="filter-btn ${i === 0 ? 'is-active' : ''}" data-filter="${c}" aria-pressed="${i === 0}">${c}</button>
  `).join('');

  filtersWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    $$('.filter-btn').forEach((b) => {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });

    const filter = btn.dataset.filter;
    $$('.project-card').forEach((card) => {
      const show = filter === 'All' || card.dataset.tags.split('|').includes(filter);
      if (show && card.classList.contains('is-hidden')) {
        // enter: unhide, then animate from a scaled/faded state
        card.classList.remove('is-hidden');
        card.classList.add('is-entering');
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('is-entering')));
      } else if (!show) {
        card.classList.add('is-hidden');
      }
    });
  });

  } /* end projects guard */

  /* ==================== RENDER: TIMELINE ==================== */
  if ($('#timeline')) {
    $('#timeline').innerHTML = SITE_DATA.timeline.map((t) => `
      <li class="timeline__item timeline__item--${t.type} reveal">
        <span class="timeline__dot" aria-hidden="true"></span>
        <span class="timeline__period">${t.period}</span>
        <h3 class="timeline__title">${t.title}</h3>
        <span class="timeline__org">${t.org}</span>
        <ul class="timeline__points">${t.points.map((p) => `<li>${p}</li>`).join('')}</ul>
      </li>
    `).join('');
  }

  /* ==================== LIGHTBOX ==================== */
  const lightbox = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbDots = $('#lb-dots');
  let lbProject = null;
  let lbIndex = 0;
  let lastFocused = null;

  function lbRender() {
    const imgs = lbProject.images;
    lbImg.src = imgs[lbIndex];
    lbImg.alt = `${lbProject.title} — image ${lbIndex + 1} of ${imgs.length}`;

    const multi = imgs.length > 1;
    $('[data-lb-prev]').disabled = !multi;
    $('[data-lb-next]').disabled = !multi;
    lbDots.innerHTML = multi
      ? imgs.map((_, i) => `<i class="${i === lbIndex ? 'is-active' : ''}"></i>`).join('')
      : '';
  }

  // Opens for projects and gallery events alike (stack/links optional).
  function lbOpen(project, startIndex = 0) {
    lbProject = project;
    lbIndex = startIndex;
    lastFocused = document.activeElement;

    $('#lb-title').textContent = project.title;
    $('#lb-desc').textContent = project.description;
    $('#lb-stack').innerHTML = (project.stack || []).map((s) => `<li>${s}</li>`).join('');

    const links = [];
    if (project.links?.live) links.push(`<a class="btn btn--primary btn--sm" href="${project.links.live}" target="_blank" rel="noopener">Live Demo ↗</a>`);
    if (project.links?.github) links.push(`<a class="btn btn--ghost btn--sm" href="${project.links.github}" target="_blank" rel="noopener">GitHub ↗</a>`);
    $('#lb-links').innerHTML = links.join('');

    lbRender();
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    $('.lightbox__close').focus();
  }

  function lbClose() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    lastFocused?.focus();
  }

  function lbStep(dir) {
    if (!lbProject || lbProject.images.length < 2) return;
    lbIndex = (lbIndex + dir + lbProject.images.length) % lbProject.images.length;
    lbRender();
  }

  // open from card (click or Enter/Space) — main page only
  if (grid) {
    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.project-card');
      if (card) lbOpen(SITE_DATA.projects[+card.dataset.index]);
    });
    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.project-card');
      if (card) { e.preventDefault(); lbOpen(SITE_DATA.projects[+card.dataset.index]); }
    });
  }

  // close / nav buttons
  lightbox.addEventListener('click', (e) => {
    if (e.target.closest('[data-lb-close]')) lbClose();
    if (e.target.closest('[data-lb-prev]')) lbStep(-1);
    if (e.target.closest('[data-lb-next]')) lbStep(1);
  });

  // keyboard: Esc to close, arrows to navigate, Tab trapped inside dialog
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
    if (e.key === 'Tab') {
      const focusables = $$('button:not([disabled]), a[href]', lightbox);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // swipe support for touch devices
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) lbStep(dx > 0 ? -1 : 1);
    touchX = null;
  }, { passive: true });

  /* ==================== GALLERY ==================== */
  // Production (GitHub Pages): events come from js/gallery.js, which the
  // deploy workflow auto-generates from assets/gallery/ folders.
  // Local preview: the dev server's directory listing is read live, so a
  // newly added folder/photo appears on refresh — no build step needed.
  const galleryWrap = $('#gallery-events');

  const IMG_RE = /\.(jpe?g|png|webp|gif|svg|avif)$/i;

  // Parse links out of a server directory-listing page (python http.server etc.)
  async function listDir(url) {
    const res = await fetch(url);
    if (!res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return null;
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    const names = [...doc.querySelectorAll('a[href]')]
      .map((a) => decodeURIComponent(a.getAttribute('href')))
      .filter((h) => !h.startsWith('.') && !h.startsWith('/') && !h.startsWith('?') && !h.includes('://'));
    return names;
  }

  // Build gallery data by reading assets/gallery/ live (works on dev servers only).
  async function loadGalleryFromFolders() {
    try {
      const folders = (await listDir('assets/gallery/'))?.filter((n) => n.endsWith('/'));
      if (!folders?.length) return null;
      const events = [];
      for (const folder of folders.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))) {
        const files = (await listDir(`assets/gallery/${folder}`)) || [];
        const photos = files.filter((f) => IMG_RE.test(f)).sort()
          .map((f) => `assets/gallery/${folder}${f}`);
        if (!photos.length) continue;
        let caption = '';
        if (files.some((f) => f.toLowerCase() === 'caption.txt')) {
          caption = (await (await fetch(`assets/gallery/${folder}caption.txt`)).text()).trim();
        }
        events.push({
          event: folder.replace(/\/$/, '').replace(/^\d+[\s._-]+/, '').trim() || folder,
          caption,
          photos,
        });
      }
      return events.length ? events : null;
    } catch {
      return null;
    }
  }

  function renderGallery(galleryData) {
    if (!galleryData.length) {
      galleryWrap.innerHTML = '<p class="gallery-empty">No events yet — photos coming soon.</p>';
      return;
    }
    galleryWrap.innerHTML = galleryData.map((ev, ei) => `
      <article class="gallery-event reveal is-visible">
        <header class="gallery-event__head">
          <h3>${ev.event}</h3>
        </header>
        ${ev.caption ? `<p class="gallery-event__caption">${ev.caption}</p>` : ''}
        <ul class="gallery-grid">
          ${ev.photos.map((src, pi) => `
            <li>
              <button type="button" data-event="${ei}" data-photo="${pi}" aria-label="View photo ${pi + 1} of ${ev.event}">
                <img src="${src}" alt="${ev.event} — photo ${pi + 1}" loading="lazy" width="800" height="600" />
              </button>
            </li>`).join('')}
        </ul>
      </article>
    `).join('');

    galleryWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-event]');
      if (!btn) return;
      const ev = galleryData[+btn.dataset.event];
      lbOpen({ title: ev.event, description: ev.caption, images: ev.photos }, +btn.dataset.photo);
    });
  }

  if (galleryWrap) {
    const manifest = typeof GALLERY_DATA !== 'undefined' ? GALLERY_DATA : [];
    // Prefer live folder contents (local dev); fall back to the manifest (production).
    loadGalleryFromFolders().then((live) => renderGallery(live || manifest));
  }

  /* ==================== SCROLL REVEAL ==================== */
  // Elements with .reveal fade/slide in when entering the viewport.
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* ==================== MISC ==================== */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
