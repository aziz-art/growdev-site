// Generators for everything search engines and AI assistants read: JSON-LD, sitemap, robots.txt, llms.txt.
// Pure functions: (site config, dictionaries) -> strings. No dependencies.

export const SERVICES = [
  { id: "odoo", key: "svc.odoo", anchor: "svc-odoo" },
  { id: "digital", key: "svc.digital", anchor: "svc-digital" },
  { id: "web", key: "svc.web", anchor: "svc-web" },
  { id: "wordpress", key: "svc.wp", anchor: "svc-wp" },
  { id: "prestashop", key: "svc.shop", anchor: "svc-shop" },
  { id: "mobile", key: "svc.mobile", anchor: "svc-mobile" },
  { id: "automation", key: "svc.auto", anchor: "svc-auto" }
];
export const FAQ_COUNT = 8;

const AREA = [
  { "@type": "Country", name: "Tunisia" },
  { "@type": "Continent", name: "Africa" },
  "Worldwide"
];

export function pageUrl(cfg, lang) {
  return cfg.url + cfg.langs.find((l) => l.code === lang).path;
}

/** One @graph per language page: organisation, founder, website, page, services and FAQ share stable @ids. */
export function jsonLd(cfg, D, lang, ctx) {
  const T = (k) => D[lang][k];
  const url = cfg.url, page = pageUrl(cfg, lang);
  const org = url + "/#organization", website = url + "/#website", founder = url + "/#founder", webpage = page + "#webpage";
  const graph = [
    {
      "@type": ["Organization", "ProfessionalService"],
      "@id": org,
      name: cfg.name,
      url: url + "/",
      logo: { "@type": "ImageObject", url: url + "/assets/img/icon-512.png", width: 512, height: 512 },
      image: ctx.ogImage,
      slogan: T("foot.tag"),
      description: T("ld.desc"),
      email: cfg.email,
      address: { "@type": "PostalAddress", addressCountry: "TN" },
      areaServed: AREA,
      knowsLanguage: cfg.langs.map((l) => l.code),
      knowsAbout: ["Odoo", "ERP", "Digital transformation", "WordPress", "PrestaShop", "Flutter", "Python", "Django", "Business automation"],
      founder: { "@id": founder },
      contactPoint: {
        "@type": "ContactPoint", contactType: "sales", email: cfg.email,
        availableLanguage: cfg.langs.map((l) => l.englishName), areaServed: ["TN", "Africa", "Worldwide"]
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog", name: T("ld.catalog"),
        itemListElement: SERVICES.map((s) => ({ "@type": "Offer", itemOffered: { "@id": url + "/#service-" + s.id } }))
      },
      ...(cfg.sameAs && cfg.sameAs.length ? { sameAs: cfg.sameAs } : {})
    },
    {
      "@type": "Person", "@id": founder, name: cfg.founder, jobTitle: T("ld.founder.job"),
      worksFor: { "@id": org }, knowsLanguage: cfg.langs.map((l) => l.code)
    },
    {
      "@type": "WebSite", "@id": website, url: url + "/", name: cfg.name,
      publisher: { "@id": org }, inLanguage: cfg.langs.map((l) => l.code)
    },
    {
      "@type": "WebPage", "@id": webpage, url: page, name: T("meta.title"), description: T("meta.desc"),
      inLanguage: lang, isPartOf: { "@id": website }, about: { "@id": org },
      primaryImageOfPage: { "@type": "ImageObject", url: ctx.ogImage, width: 1200, height: 630 },
      dateModified: ctx.lastmod
    },
    ...SERVICES.map((s) => ({
      "@type": "Service", "@id": url + "/#service-" + s.id, name: T(s.key + ".t"), description: T(s.key + ".p"),
      provider: { "@id": org }, areaServed: AREA, url: page + "#" + s.anchor
    })),
    {
      "@type": "FAQPage", "@id": page + "#faq", url: page + "#faq", inLanguage: lang, isPartOf: { "@id": webpage },
      mainEntity: Array.from({ length: FAQ_COUNT }, (_, i) => ({
        "@type": "Question", name: T(`faq.q${i + 1}`),
        acceptedAnswer: { "@type": "Answer", text: T(`faq.a${i + 1}`) }
      }))
    }
  ];
  return { "@context": "https://schema.org", "@graph": graph };
}

export function sitemap(cfg, lastmod) {
  const alt = (l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${cfg.url + l.path}"/>`;
  const xdef = cfg.langs.find((l) => l.code === cfg.xDefault);
  const urls = cfg.langs.map((l) => [
    "  <url>", `    <loc>${cfg.url + l.path}</loc>`, `    <lastmod>${lastmod}</lastmod>`,
    ...cfg.langs.map(alt),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${cfg.url + xdef.path}"/>`,
    "  </url>"
  ].join("\n"));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`;
}

// Crawlers that fetch pages for search or live answers (allowed) and for model training (also allowed by default).
// To opt out of training only, move the "training" agents under "Disallow: /".
const AI_SEARCH = ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Applebot", "DuckAssistBot", "MistralAI-User"];
const AI_TRAINING = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"];

export function robots(cfg) {
  const block = (agents) => agents.map((a) => `User-agent: ${a}`).join("\n") + "\nAllow: /\n";
  return [
    "# GrowDev — everyone is welcome, including search engines and AI assistants.",
    "User-agent: *\nAllow: /\n",
    "# AI assistants that answer questions with live web results",
    block(AI_SEARCH),
    "# AI crawlers used for model training (allowed; move them under Disallow to opt out)",
    block(AI_TRAINING),
    `Sitemap: ${cfg.url}/sitemap.xml`,
    ""
  ].join("\n");
}

const firstSentence = (s) => (s.match(/^.+?[.!?](\s|$)/) || [s])[0].trim();

export function llms(cfg, D) {
  const E = D.en, url = cfg.url;
  const en = cfg.langs.find((l) => l.code === "en");
  const lines = [
    `# ${cfg.name}`, "",
    `> ${E["ld.desc"]}`, "",
    "## Key facts", "",
    `- Name: ${cfg.name} (slogan: "${E["foot.tag"]}")`,
    `- ${E["facts.k2"]}: ${E["facts.v2"]}`,
    `- ${E["facts.k1"]}: ${E["facts.v1"]}`,
    `- ${E["facts.k3"]}: ${E["facts.v3"]}`,
    `- ${E["facts.k4"]}: ${E["facts.v4"]}`,
    `- ${E["facts.k5"]}: ${E["facts.v5"]}`,
    `- Founder: ${cfg.founder}, ${E["ld.founder.job"].toLowerCase()}`,
    `- ${E["facts.k6"]}: ${cfg.email}`, "",
    "## Pages", "",
    ...cfg.langs.map((l) => `- [${l.nativeName}](${url + l.path}): ${D[l.code]["meta.desc"]}`), "",
    "## Services", "",
    ...SERVICES.map((s) => `- [${E[s.key + ".t"]}](${url + en.path}#${s.anchor}): ${E[s.key + ".p"]}`), "",
    "## FAQ", "",
    ...Array.from({ length: FAQ_COUNT }, (_, i) => `- [${E[`faq.q${i + 1}`]}](${url + en.path}#faq): ${firstSentence(E[`faq.a${i + 1}`])}`), "",
    "## Optional", "",
    `- [Full text of the site in French, Arabic and English](${url}/llms-full.txt)`,
    `- [Sitemap](${url}/sitemap.xml)`, ""
  ];
  return lines.join("\n");
}

const strip = (s) => s.replace(/<[^>]+>/g, "");

export function llmsFull(cfg, D) {
  const out = [`# ${cfg.name} — full text`, "", `Source: ${cfg.url}/ · Contact: ${cfg.email}`, ""];
  for (const L of [cfg.langs.find((l) => l.code === "en"), ...cfg.langs.filter((l) => l.code !== "en")]) {
    const T = D[L.code];
    out.push(`# ${L.nativeName} (${L.code})`, "", `URL: ${cfg.url + L.path}`, "", `## ${T["meta.title"]}`, "", T["meta.desc"], "", strip(T["hero.lead"]), "", `## ${T["svc.title"]}`, "", T["svc.lead"], "");
    for (const s of SERVICES) {
      out.push(`### ${T[s.key + ".t"]}`, "", T[s.key + ".p"], "");
      const bullets = Object.keys(T).filter((k) => k.startsWith(s.key + ".c")).sort();
      bullets.forEach((k) => out.push(`- ${T[k]}`));
      if (bullets.length) out.push("");
    }
    out.push(`## ${T["method.title"]}`, "", T["method.lead"], "");
    for (let i = 1; i <= 5; i++) out.push(`${i}. ${T[`m${i}.t`]}: ${T[`m${i}.p`]}`);
    out.push("", `## ${T["about.title"]}`, "", T["about.p1"], "", T["about.who"], "", `### ${T["facts.t"]}`, "");
    for (let i = 1; i <= 5; i++) out.push(`- ${T[`facts.k${i}`]}: ${T[`facts.v${i}`]}`);
    out.push(`- ${T["facts.k6"]}: ${cfg.email}`, "", `## ${T["faq.eyebrow"]}`, "");
    for (let i = 1; i <= FAQ_COUNT; i++) out.push(`### ${T[`faq.q${i}`]}`, "", T[`faq.a${i}`], "");
  }
  return out.join("\n");
}
