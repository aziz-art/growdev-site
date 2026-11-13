# Handover: where the project stands (2026-11-07)

Read this first in a new session. Then `README.md`, then the other files in `docs/`.

## State

- Trilingual static site (fr `/`, ar `/ar/` RTL, en `/en/`), generated from `src/` by `tools/build.mjs`. DT is the first currency. SEO, GEO and AEO layer built in.
- `node tools/build.mjs && node tools/check.mjs` ends with **All checks passed** (1,029 checks; the checker was tested against deliberate breakages, including the new robots and CNAME rules).
- Address: `https://growdev-tn.github.io/`. It is the single `url` setting in `src/site.json`; the sitemap, canonical tags, `hreflang`, JSON-LD, share-image links, `llms.txt`, `robots.txt` and the launch script all follow it. There is no `site/CNAME` (the build removes it for a `github.io` address and writes it for a custom domain).
- GitHub: user `aziz-art`, organization `growdev-tn`, repository `growdev-tn/growdev-tn.github.io`, remote `git@github.com:growdev-tn/growdev-tn.github.io.git`. `sameAs` in `src/site.json` lists `https://github.com/aziz-art`.
- `robots.txt` blocks the AI training crawlers (`"allowAiTraining": false`) and allows search engines and AI assistants that answer with live results.
- The share images `og-fr/ar/en.jpg` show `growdev-tn.github.io`. They come from `tools/og.html`; regenerate them with `npm run og` whenever the address changes.
- Deployed with `.github/workflows/pages.yml` (Pages source: GitHub Actions). `docs/DEPLOY.md` and `tools/verify-launch.sh` describe and test it. No DNS record is used. The old plan (`growdev.werchti.tn` through OVH) was dropped on 2026-11-07.

## Open tasks

1. **Independent UX/UI audit**: not done (see `docs/UX-AUDIT.md`). Fix findings, then write the report.
2. **Tests not yet run:** accessibility scan with axe-core (all three pages, 1440 and 390 px), a 768 px tablet pass, keyboard pass (tab order, focus ring, mobile menu with Escape, FAQ with Enter/Space), `prefers-reduced-motion` pass, LCP/CLS measurement.
3. **`docs/ARCHITECTURE.md` section 4:** replace the targets with measured numbers once the tests above are done. `docs/CREATIVE-BRIEF.md` states 768 px was checked; make that true or reword it.
4. **Preview and video:** no online preview and no demo video were produced.
5. **After each push:** run `bash tools/verify-launch.sh`, then do the launch checklist in `docs/SEO-GEO-AEO.md` §3 (Search Console as a URL-prefix property, Bing, Rich Results test).

## Questions for the owner (draft content to confirm)

- Founder name and Arabic spelling (currently «عزيز الشايبي»).
- FAQ quote policy: no fixed prices; DT in Tunisia, € or $ abroad.
- Simulator default hourly costs (15 DT, 50 MAD, 700 DZD, 250 EGP, 3 000 XOF, 20 €, 22 $) are rough placeholders.
- Official Odoo partner? (nothing in the copy claims it.)
- Case studies: which projects may be named (Werchti, IqrarSanté?).
- A WhatsApp or phone number to add (only e-mail today).
- A native reader should review `src/i18n/ar.json`.
- "GEO" was read both as Generative Engine Optimization and as geographic targeting.

## Rules and gotchas

- Edit `src/` only. `site/index.html`, `site/ar/index.html`, `site/en/index.html`, `site/assets/js/dict-*.js`, sitemap, robots and llms files are generated.
- Share images: `tools/og.html` → `npm run og` (needs Playwright, developer machine only). The build fails if `og-<lang>.jpg` is missing.
- `site/404.html` uses absolute paths: it works at the root of a host, which is where the site now lives. It would not work under a sub-path such as `…github.io/some-repo/`.
- GitHub Pages cannot set response headers; the CSP is a `<meta>` tag. 28 inline `style` attributes keep `style-src 'unsafe-inline'`.
- The test scripts used so far (Playwright screenshots, interaction checks) lived in a scratch folder and are not part of the repo.
