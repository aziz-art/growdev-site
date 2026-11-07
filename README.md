# GrowDev: portfolio site

Animated portfolio for **GrowDev** (Odoo ERP, web, WordPress, PrestaShop, mobile apps, automation), in **French, Arabic and English**, for Tunisia first, then Africa, then the world.

Live address: **https://growdev.werchti.tn/** · French `/` · Arabic `/ar/` (right-to-left) · English `/en/`

No framework, no runtime dependencies, no cookies, no third-party requests. A zero-dependency Node script turns one template and three dictionaries into three real HTML pages.

## ⚠️ The one rule

**Edit `src/`. Never edit the generated files.** They are overwritten by every build (locally and in CI):

`site/index.html` · `site/ar/index.html` · `site/en/index.html` · `site/assets/js/dict-*.js` · `site/sitemap.xml` · `site/robots.txt` · `site/llms.txt` · `site/llms-full.txt`

## Everyday commands

You need Node 18 or newer. Nothing to install.

```bash
node tools/build.mjs      # src/ → site/   (fails if a translation is missing or inconsistent)
node tools/check.mjs      # SEO, links, accessibility basics, CSP, size budgets (fails the deploy)
npm run serve             # preview at http://localhost:8080  (needs python3)
```

## What to edit

| To change… | Edit |
|---|---|
| Any text (all three languages) | `src/i18n/fr.json`, `src/i18n/ar.json`, `src/i18n/en.json`. Keep the same keys in all three; the build tells you what is missing |
| Page structure, sections, order | `src/index.template.html` (`data-i18n="key"` marks translated text) |
| E-mail, founder, URL, social profiles (`sameAs`), languages | `src/site.json` |
| Structured data, sitemap, robots, llms.txt | `tools/seo.mjs` |
| Look and animation | `site/assets/css/styles.css`, `site/assets/js/*.js` |
| Simulator hourly costs, default currency | `site/assets/js/config.js` |
| Share images (WhatsApp, LinkedIn…) | `tools/og.html`, then `npm i -D playwright && npx playwright install chromium && npm run og` |

## Project layout

```
src/                  sources: template, translations, site facts
site/                 what gets published (generated pages + static assets)
tools/                build.mjs · check.mjs · seo.mjs · make-og.cjs · og.html
docs/                 documentation (see below)
.github/workflows/    build → check → deploy to GitHub Pages
branding/             original logo file
```

## Publish

Push to `main`. GitHub Actions builds, runs the checks and deploys in about a minute. First-time setup (repository, Pages, custom domain, OVH DNS): **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Documentation

| File | What it is |
|---|---|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Step-by-step publishing: GitHub, Pages, domain, OVH DNS, troubleshooting |
| [docs/SEO-GEO-AEO.md](docs/SEO-GEO-AEO.md) | What is built in for search engines and AI assistants, keyword map, launch checklist |
| [docs/CREATIVE-BRIEF.md](docs/CREATIVE-BRIEF.md) | Audience, messaging, tone, visual direction, open questions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Principles, stack decisions, security, performance, design system, roadmap |
| [docs/UX-AUDIT.md](docs/UX-AUDIT.md) | Independent UX/UI audit and what was fixed |

## Credits and licence

Fonts (self-hosted, SIL Open Font License 1.1): [Sora](https://github.com/sora-xor/sora-font), [IBM Plex Sans, Mono and Sans Arabic](https://github.com/IBM/plex).

No open-source licence is granted for the code or the brand assets: all rights reserved by GrowDev unless the owner adds a `LICENSE` file.
