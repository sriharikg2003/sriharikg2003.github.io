# Srihari K G — Portfolio Website

A fast, dependency-free, fully static portfolio built with vanilla **HTML / CSS / JS**. Designed for GitHub Pages — no build step, no framework, no backend.

**Live site:** https://sriharikg2003.github.io/

## Features

- 🌗 Dark/light mode — respects system preference, persisted in `localStorage`
- 🎨 Modern design: fluid typography, gradient hero, glassmorphism nav, custom cursor
- 📱 Mobile-first responsive, 320px → 4K
- ✨ Scroll-triggered reveal animations (IntersectionObserver, respects `prefers-reduced-motion`)
- 🖼️ Filterable project gallery + lightbox with keyboard nav (←/→/Esc) and touch swipe
- 📝 Single-file content management (`js/data.js`)
- ♿ Accessible: semantic HTML, ARIA, focus trap in modal, skip link, keyboard navigable
- 🔍 SEO: meta/OG/Twitter tags, JSON-LD, sitemap, robots.txt, favicon
- ⚡ Performance: lazy-loaded images, async fonts, zero JS dependencies

## Project structure

```
├── index.html              # Markup (sections are shells; content injected from data.js)
├── css/style.css           # All styles, design tokens at top
├── js/data.js              # ← ALL CONTENT LIVES HERE (bio, skills, projects, timeline)
├── js/main.js              # Behavior: theme, filters, lightbox, animations
├── assets/
│   ├── img/                # Project images (placeholder SVGs — swap for screenshots)
│   ├── resume/             # Downloadable CV
│   └── favicon.svg
├── .github/workflows/deploy.yml   # Auto-deploy to GitHub Pages
├── sitemap.xml / robots.txt
└── .nojekyll               # Serve files as-is (skip Jekyll)
```

## Customizing content

Everything editable is in **`js/data.js`**:

- **Add a project** — append an object to `projects`:
  ```js
  {
    title: 'My New Project',
    description: 'What it does and why it matters.',
    tags: ['Machine Learning'],            // must match `categories`
    stack: ['Python', 'PyTorch'],
    images: ['assets/img/my-shot.png'],    // first image = card thumbnail
    links: { live: 'https://…', github: 'https://github.com/…' }, // both optional
  }
  ```
- **Skills / timeline / taglines / bio** — edit the corresponding arrays.

### Gallery — no code needed

Create a folder under `assets/gallery/` and drop photos in. Done.

```
assets/gallery/
├── 01 Convocation - IIT Dharwad/   ← folder name = event title
│   ├── any-photo.jpg               ← photos shown alphabetically
│   └── caption.txt                 ← optional caption (one line)
└── 02 Another Event/
```

- A leading number ("01 ", "02 ") controls event order and is hidden from the title.
- `caption.txt` is optional.
- **Local preview:** folders are read live — add photos, refresh the browser, done.
- **Live site:** the manifest (`js/gallery.js`) regenerates automatically on every push via GitHub Actions.
- **Swap placeholder images** — drop real screenshots into `assets/img/` and update the `images` paths (PNG/JPG/WebP all fine; ~1280×800 recommended).
- **Update the resume** — replace `assets/resume/Srihari_KG_CV.pdf`.

## Contact form setup (optional)

The form currently falls back to opening a pre-filled email draft (`mailto:`).
To get submissions without leaving the page:

1. Create a free form at [formspree.io](https://formspree.io)
2. In `index.html`, replace `YOUR_FORM_ID` in the form's `action` attribute.

## Run locally

No build step — open `index.html` directly, or serve it (recommended, for correct font/CORS behavior):

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy to GitHub Pages

### Option A — user site (recommended): `sriharikg2003.github.io`

1. Create a repo named **`sriharikg2003.github.io`**
2. Push this folder to `main`:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin git@github.com:sriharikg2003/sriharikg2003.github.io.git
   git push -u origin main
   ```
3. Repo **Settings → Pages → Source: GitHub Actions** — the included workflow deploys automatically on every push.

### Option B — project page: `sriharikg2003.github.io/<repo-name>`

Same steps with any repo name. Then update absolute URLs in `index.html` (canonical/OG), `sitemap.xml` and `robots.txt` to include the repo path.

## Lighthouse tips

The site is built to score 90+ out of the box. To keep it that way:

- Compress real screenshots (WebP, ≤200 KB each)
- Keep `loading="lazy"` on gallery images
- Don't add render-blocking scripts to `<head>`

---

© Srihari K G · MIT-style — reuse the code freely, please replace the personal content.
