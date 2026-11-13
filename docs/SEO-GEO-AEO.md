# SEO · GEO · AEO — GrowDev

Tunisia first, then Africa, then the world. Three languages, one URL each: `/` (français), `/ar/` (العربية), `/en/` (English).

**GEO** is used in both senses, because the term means two things today:

- **Generative Engine Optimization**: being found, understood and quoted correctly by AI assistants (ChatGPT, Claude, Perplexity, Gemini, Copilot).
- **Geographic targeting**: telling search engines which country and languages the site serves.

**AEO** (Answer Engine Optimization) means giving direct, quotable answers to the questions buyers actually ask.

## 1. What is built in

| Layer | What the site does | Where |
|---|---|---|
| **SEO** | One prerendered HTML page per language: the content is readable without JavaScript. Unique `<title>` and meta description per language, canonical URL, `hreflang` fr / ar / en plus `x-default` (English), Open Graph and Twitter cards with a share image per language. `sitemap.xml` with the alternates, `robots.txt`, one `<h1>` and a clean heading outline. | `tools/build.mjs`, `tools/seo.mjs`, `src/i18n/*.json` |
| **GEO — generative** | `llms.txt` (short summary and links) and `llms-full.txt` (whole site text in three languages). Explicit rules in `robots.txt` for the AI search and user agents and for the training crawlers. One JSON-LD `@graph` per page with stable `@id`s: Organization + ProfessionalService, founder (Person), WebSite, WebPage, 7 Services, FAQPage. A visible "GrowDev en bref" fact list says the same facts in every language. | `tools/seo.mjs`, `src/index.template.html` |
| **GEO — geographic** | `areaServed` lists Tunisia, Africa and Worldwide. `geo.region=TN`. Tunisia-first copy (SMEs in Tunisia, quotes in DT first, € or $ abroad). `og:locale` and `inLanguage` per page. Language targeting through `hreflang`, not through a country setting. | `src/site.json`, `tools/seo.mjs` |
| **AEO** | A visible FAQ of 8 questions, each answered in the first sentence, then detailed. The same text is published as `FAQPage` JSON-LD. The checker fails the build if the two ever differ. | `src/i18n/*.json` (`faq.*`), `tools/check.mjs` |

**Honest notes**

- Since August 2023 Google shows FAQ rich results only for well-known government and health sites. The `FAQPage` markup will therefore not produce expandable results for GrowDev in Google. It is kept because it is valid, other engines and AI tools can read it, and the visible FAQ is the real answer-engine asset.
- No major AI provider has confirmed that it ranks pages using `llms.txt`. It costs nothing, and assistants and agents that fetch pages do read it. Treat it as a bonus, not a lever.
- Nobody can promise rankings or AI citations. New sites usually take weeks to months to settle. The work here removes technical obstacles and gives the engines clear, consistent facts.
- `geo.*` meta tags are ignored by Google; they are a harmless hint for other engines.
- There is no `aggregateRating`, no review and no client list in the markup: nothing is invented. Add them only when they are real and visible on the page.

## 2. Keyword map

I could not run a keyword-volume tool from here, so these are working hypotheses. Confirm them with Search Console after the first month. A live look at the results showed:

- **French** queries ("intégrateur Odoo Tunisie", "création site web Tunisie") are dominated by directories (Sortlist, Clutch, ERPResearch, Elioplus, GoAfricaOnline) and Odoo's own partner pages.
- **Arabic** queries mostly return freelance marketplaces (Khamsat) and Odoo's Arabic partner pages. Few Tunisian companies have a real Arabic page, so `/ar/` has a good chance to rank.

| | Français (`/`) | العربية (`/ar/`) | English (`/en/`) |
|---|---|---|---|
| **Main** | ERP Odoo Tunisie · développement web Tunisie · application mobile Tunisie | نظام Odoo ERP تونس · تطوير مواقع الويب تونس · تطبيقات الجوال تونس | Odoo ERP Tunisia · web development Tunisia · mobile app development Tunisia |
| **Secondary** | implémentation Odoo · développement Odoo sur mesure · site WordPress · boutique PrestaShop · transformation digitale PME · automatisation | تنفيذ Odoo · وحدات Odoo مخصصة · متجر إلكتروني · التحول الرقمي للمؤسسات · الأتمتة | Odoo implementation · custom Odoo modules · WordPress site · PrestaShop store · digital transformation for SMEs · automation |
| **Questions (FAQ)** | Odoo convient-il à une PME tunisienne ? · combien coûte un projet Odoo… · combien de temps faut-il… | هل يناسب Odoo المؤسسات الصغرى والمتوسطة في تونس؟ · كم تبلغ كلفة مشروع Odoo… | Is Odoo a good fit for a Tunisian small or medium business? · how much does an Odoo project… · how long does it take… |
| **On the page** | title, description, `h1`, services, FAQ, facts | same, written natively (not translated word for word) | same |

Rules for editing the copy:

- Write each language for its readers. Do not translate sentence by sentence.
- Keep the title under 65 characters and the description between 70 and 165 (the checker enforces both).
- Mention Tunisia in the title or description of every language.
- **Do not claim "official Odoo partner" or "certified"** unless GrowDev is listed as such by Odoo. Nothing in the current copy says so.

## 3. Launch checklist (in this order)

1. **Deploy and check HTTPS** (see `docs/DEPLOY.md`). Open `/`, `/ar/`, `/en/`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`.
2. **Google Search Console.** Add a *URL prefix* property for `https://growdev-tn.github.io/` (a *Domain* property needs a DNS record, which a `github.io` address cannot have). Verify with the *HTML file* method: put the file Google gives you in `site/`, push, then click Verify. Then submit `https://growdev-tn.github.io/sitemap.xml` and use *URL inspection → Request indexing* for the three pages. Details are in `docs/DEPLOY.md`.
3. **Bing Webmaster Tools.** Import the site from Search Console, then submit the same sitemap. Bing's index also feeds Microsoft Copilot and some other assistants.
4. **Validate the markup.** Run the three URLs through the Google Rich Results Test and validator.schema.org. Run PageSpeed Insights on mobile.
5. **Google Business Profile.** Create a *Software company* profile (service-area business if there is no public address). Use the same name, email and website everywhere.
6. **Entity links (`sameAs`).** `sameAs` already lists `https://github.com/aziz-art`. Create the LinkedIn company page, and consider adding the GitHub organisation `https://github.com/growdev-tn` (it already exists), then add their URLs to `sameAs` in `src/site.json` (and a `sameAs` for the founder if he wants one). Rebuild. These links are the strongest signal that tells engines and AI tools "this is the same entity".
7. **Backlinks.** Link to the site from `werchti.tn`, from the founder's LinkedIn and GitHub profiles, and from directories where GrowDev qualifies (Sortlist, Clutch, GoAfricaOnline). Odoo.com's partner directory only if GrowDev is an official partner.
8. **Share test.** Paste each URL into WhatsApp, LinkedIn and Facebook to see the language-specific share image.

## 4. Routine

- Edit text in `src/i18n/*.json` only, then run `npm run build && npm run check`. Never edit `site/*.html` by hand: the build overwrites it.
- The sitemap `lastmod` comes from the last git commit that touched `src/` or `site/assets/`.
- To add a FAQ item: add `faq.qN` and `faq.aN` to the three JSON files, add the `<details>` block to `src/index.template.html`, and raise `FAQ_COUNT` in `tools/seo.mjs`. The build and the checker tell you if something is missing.
- Each month: look at Search Console (Performance → by country and by language), turn real queries into new FAQ entries, and refresh the facts block when something changes (services, prices policy, languages).
- Next content step: one short case study per project in the three languages, once clients agree to be named. Real case studies are the best source of citations for both search and AI answers.

## 5. AI crawlers

`robots.txt` is generated from `tools/seo.mjs` and `src/site.json`. It allows search engines and names the AI agents explicitly so the policy is visible:

- **Search and live-answer agents** (allowed): OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Applebot, DuckAssistBot, MistralAI-User.
- **Training crawlers** (**blocked**, `"allowAiTraining": false` in `src/site.json`): GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot. Blocking `Google-Extended` does not affect Google Search.

To allow training instead, set `"allowAiTraining": true` in `src/site.json` and rebuild; the checker follows the setting. Search visibility and live answers are not affected either way. `robots.txt` is a request that reputable crawlers respect, not a lock.

## 6. What the checker enforces (`npm run check`)

Per page: `lang`/`dir`, title and description length and uniqueness, canonical, reciprocal `hreflang`, Open Graph and Twitter tags, 1200×630 share image, one `h1` and no skipped heading level, valid JSON-LD with no dangling `@id`, FAQ text identical on the page and in JSON-LD, working internal links and anchors, `alt` on images, labels on form fields, accessible names on links and buttons, CSP present, no inline scripts, no resource from another host, Arabic fonts only on the Arabic page, DT first in the currency list, size budgets.

Site-wide: sitemap and alternates, `robots.txt`, `llms.txt` links, `CNAME`, `.nojekyll`, `404.html`, web manifest, files referenced by the CSS.

CI runs the build and the checker before every deployment: a broken page never goes live.
