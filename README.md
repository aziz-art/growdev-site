# GrowDev: portfolio site

Animated portfolio for **GrowDev** (Odoo ERP, web, WordPress, PrestaShop, mobile apps, automation), in **French, Arabic and English**, for Tunisia first, then Africa, then the world.

Live address: **https://growdev-tn.github.io/** · French `/` · Arabic `/ar/` (right-to-left) · English `/en/`

No framework, no runtime dependencies, no cookies, no third-party requests. A zero-dependency Node script turns one template and three dictionaries into three real HTML pages.

## ⚠️ The one rule

**Edit `src/`. Never edit the generated files.** They are overwritten by every build (locally and in CI):

`site/index.html` · `site/ar/index.html` · `site/en/index.html` · `site/assets/js/dict-*.js` · `site/sitemap.xml` · `site/robots.txt` · `site/llms.txt` · `site/llms-full.txt`

`site/CNAME` is also managed by the build: it exists only when `url` in `src/site.json` is a custom domain, and is removed for a `github.io` address.

## Everyday commands

You need Node 18 or newer, or Docker. Nothing else to install.

```bash
node tools/build.mjs      # src/ → site/   (fails if a translation is missing or inconsistent)
node tools/check.mjs      # SEO, links, accessibility basics, CSP, size budgets (fails the deploy)
npm run serve             # preview at http://localhost:8080  (needs python3)
```

Without Node on your PC (Windows, PowerShell), run the same two commands in Docker, from the project folder:

```powershell
docker run --rm -v "${PWD}:/app" -w /app node:22-alpine node tools/build.mjs
docker run --rm -v "${PWD}:/app" -w /app node:22-alpine node tools/check.mjs
```

## What to edit

| To change… | Edit |
|---|---|
| Any text (all three languages) | `src/i18n/fr.json`, `src/i18n/ar.json`, `src/i18n/en.json`. Keep the same keys in all three; the build tells you what is missing |
| Page structure, sections, order | `src/index.template.html` (`data-i18n="key"` marks translated text) |
| E-mail, founder, **site address (`url`)**, social profiles (`sameAs`), languages, whether AI training crawlers are allowed (`allowAiTraining`) | `src/site.json` |
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

Push to `main`. GitHub Actions builds, runs the checks and deploys in about a minute. Everyday commands (PowerShell, Docker, SSH), Search Console, the AI-crawler policy, moving to your own domain later and a first-time setup: **[docs/DEPLOY.md](docs/DEPLOY.md)**.

## Documentation

| File | What it is |
|---|---|
| [docs/DEPLOY.md](docs/DEPLOY.md) | Publishing on `growdev-tn.github.io`: PowerShell, Docker and SSH commands, Search Console, AI-crawler policy, moving to your own domain, troubleshooting |
| [docs/SEO-GEO-AEO.md](docs/SEO-GEO-AEO.md) | What is built in for search engines and AI assistants, keyword map, launch checklist |
| [docs/CREATIVE-BRIEF.md](docs/CREATIVE-BRIEF.md) | Audience, messaging, tone, visual direction, open questions |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Principles, stack decisions, security, performance, design system, roadmap |
| [docs/UX-AUDIT.md](docs/UX-AUDIT.md) | Independent UX/UI audit and what was fixed |

## Credits and licence

Fonts (self-hosted, SIL Open Font License 1.1): [Sora](https://github.com/sora-xor/sora-font), [IBM Plex Sans, Mono and Sans Arabic](https://github.com/IBM/plex).

No open-source licence is granted for the code or the brand assets: all rights reserved by GrowDev unless the owner adds a `LICENSE` file.
