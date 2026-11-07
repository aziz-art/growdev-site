# Handover: where the project stands (2026-11-06)

Read this first in a new session. Then `README.md`, then the other files in `docs/`.

## State

- Trilingual static site (fr `/`, ar `/ar/` RTL, en `/en/`), generated from `src/` by `tools/build.mjs`. DT is the first currency. SEO, GEO and AEO layer built in.
- `node tools/build.mjs && node tools/check.mjs` ends with **All checks passed** (1,006 checks; the checker was tested against 12 deliberate breakages).
- GitHub username: `aziz-art`. Planned repository: `growdev-site`. `sameAs` in `src/site.json` lists `https://github.com/aziz-art`. `site/CNAME` is exactly `growdev.werchti.tn`.
- Deployment kit is ready: `.github/workflows/pages.yml`, `docs/DEPLOY.md`, `tools/verify-launch.sh`. **Nothing has been pushed or deployed yet.** No DNS change has been made.

## Open tasks

1. **Independent UX/UI audit**: not done (see `docs/UX-AUDIT.md`). Fix findings, then write the report.
2. **Tests not yet run:** accessibility scan with axe-core (all three pages, 1440 and 390 px), a 768 px tablet pass, keyboard pass (tab order, focus ring, mobile menu with Escape, FAQ with Enter/Space), `prefers-reduced-motion` pass, LCP/CLS measurement.
3. **`docs/ARCHITECTURE.md` section 4:** replace the targets with measured numbers once the tests above are done. `docs/CREATIVE-BRIEF.md` states 768 px was checked; make that true or reword it.
4. **Preview and video:** no online preview and no demo video were produced.
5. **Deploy:** follow `docs/DEPLOY.md`, then the launch checklist in `docs/SEO-GEO-AEO.md` §3.

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
- `site/404.html` uses absolute paths: it works on the custom domain, not under `aziz-art.github.io/growdev-site/`.
- GitHub Pages cannot set response headers; the CSP is a `<meta>` tag. 28 inline `style` attributes keep `style-src 'unsafe-inline'`.
- The test scripts used so far (Playwright screenshots, interaction checks) lived in a scratch folder and are not part of the repo.
