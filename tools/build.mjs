#!/usr/bin/env node
// GrowDev static build — zero dependencies (Node 18+).
//   src/index.template.html + src/i18n/{fr,ar,en}.json  ->  site/index.html, site/ar/index.html, site/en/index.html
//   plus runtime dictionaries, sitemap.xml, robots.txt, llms.txt, llms-full.txt and (custom domains only) CNAME.
//   The site address is the single "url" setting in src/site.json; everything above is derived from it.
// Usage: node tools/build.mjs [--out DIR] [--index-links]
//   --out DIR       copy site/ to DIR and write the generated files there (site/ stays untouched)
//   --index-links   link to ".../index.html" instead of ".../" (for file:// previews and artifact hosts)
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { jsonLd, sitemap, robots, llms, llmsFull, pageUrl } from "./seo.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const INDEX_LINKS = flag("--index-links");

const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "src/site.json"), "utf8"));
const template = fs.readFileSync(path.join(ROOT, "src/index.template.html"), "utf8");
const D = Object.fromEntries(cfg.langs.map((l) => [l.code, JSON.parse(fs.readFileSync(path.join(ROOT, `src/i18n/${l.code}.json`), "utf8"))]));

let OUT = path.join(ROOT, "site");
if (opt("--out")) {
  OUT = path.resolve(opt("--out"));
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.cpSync(path.join(ROOT, "site"), OUT, { recursive: true });
}

const problems = [];
const fail = (m) => problems.push(m);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const used = new Set();

function lastmod() {
  try {
    const d = execSync("git log -1 --format=%cs -- src site/assets", { cwd: ROOT, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  } catch (e) { /* not a git checkout */ }
  return new Date().toISOString().slice(0, 10);
}
const LASTMOD = lastmod();

// ---------- dictionary checks ----------
const PLURAL = /^sum\.(zero|one|two|few|many|other)$/;
const baseKeys = Object.keys(D.fr).filter((k) => !PLURAL.test(k));
const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
const tags = (s) => [...s.matchAll(/<\/?(\w+)/g)].map((m) => m[1]).join(",");
for (const l of cfg.langs) {
  if (!D[l.code]["sum.other"]) fail(`${l.code}: sum.other is required`);
  for (const k of baseKeys) {
    if (!(k in D[l.code])) { fail(`${l.code}: missing key "${k}"`); continue; }
    if (vars(D.fr[k]) !== vars(D[l.code][k])) fail(`${l.code}: placeholders differ for "${k}"`);
    if (tags(D.fr[k]) !== tags(D[l.code][k])) fail(`${l.code}: HTML tags differ for "${k}"`);
  }
  for (const k of Object.keys(D[l.code])) if (!PLURAL.test(k) && !(k in D.fr)) fail(`${l.code}: unknown key "${k}"`);
}

// ---------- page generation ----------
const rel = (from, to) => {
  const base = from.path === "/" ? "" : "../";
  const r = base + (to.path === "/" ? "" : to.path.slice(1));
  return (r || "./") + (INDEX_LINKS && r.endsWith("/") ? "index.html" : "");
};

function render(L) {
  const T = D[L.code];
  const tr = (k) => { if (!(k in T)) { fail(`${L.code}: template uses missing key "${k}"`); return k; } used.add(k); return T[k]; };
  const base = L.path === "/" ? "" : "../";
  let html = template;

  html = html.replace(/(<(\w+)\b[^>]*?\sdata-i18n="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, key, inner, close) => open + tr(key) + close);
  html = html.replace(/<(\w+)\b[^>]*?\sdata-i18n-attr="([^"]+)"[^>]*>/g, (tagStr, tag, spec) => {
    let out = tagStr;
    for (const pair of spec.split(";")) {
      const i = pair.indexOf(":"), attr = pair.slice(0, i), val = esc(tr(pair.slice(i + 1)));
      const re = new RegExp(`(\\s${attr}=")[^"]*(")`);
      out = re.test(out) ? out.replace(re, (mm, a, b) => a + val + b) : out.replace(/>$/, ` ${attr}="${val}">`);
    }
    return out;
  });

  const ogFile = `og-${L.code}.jpg`;
  if (!fs.existsSync(path.join(OUT, "assets/img", ogFile))) fail(`${L.code}: missing assets/img/${ogFile} (run: node tools/make-og.cjs)`);
  const ogImage = `${cfg.url}/assets/img/${ogFile}`;
  const others = cfg.langs.filter((o) => o.code !== L.code);
  const xdef = cfg.langs.find((o) => o.code === cfg.xDefault);
  const entry = L.path === "/";
  const vals = {
    lang: L.code, dir: L.dir, base,
    title: esc(tr("meta.title")), description: esc(tr("meta.desc")),
    canonical: pageUrl(cfg, L.code), ogImage, ogAlt: esc(tr("meta.og.alt")), ogLocale: L.ogLocale,
    ogAlternates: others.map((o) => `<meta property="og:locale:alternate" content="${o.ogLocale}">`).join("\n"),
    hreflang: [...cfg.langs.map((o) => `<link rel="alternate" hreflang="${o.code}" href="${pageUrl(cfg, o.code)}">`),
      `<link rel="alternate" hreflang="x-default" href="${pageUrl(cfg, xdef.code)}">`].join("\n"),
    preload: (cfg.preload[L.code] || []).map((f) => `<link rel="preload" href="${base}assets/fonts/${f}.woff2" as="font" type="font/woff2" crossorigin>`).join("\n"),
    entryAttrs: entry ? " data-entry" + others.map((o) => ` data-${o.code}="${rel(L, o)}"`).join("") : "",
    langLinks: cfg.langs.map((o) => `<a href="${o.code === L.code ? "#top" : rel(L, o)}" hreflang="${o.code}" lang="${o.code}" data-lang="${o.code}" title="${o.name}"${o.code === L.code ? ' aria-current="page"' : ""}>${o.label}</a>`).join(""),
    mailSubject: encodeURIComponent(tr("contact.mailsubject")),
    jsonld: JSON.stringify(jsonLd(cfg, D, L.code, { ogImage, lastmod: LASTMOD })).replace(/</g, "\\u003c")
  };
  html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => { if (!(k in vals)) { fail(`${L.code}: unknown placeholder ${m}`); return m; } return vals[k]; });

  // sanity checks on the final page
  if (/\{\{\w+\}\}/.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, ""))) fail(`${L.code}: unreplaced placeholder left in page`);
  if (/data-i18n="[^"]+"[^>]*><\/\w+>/.test(html)) fail(`${L.code}: an element with data-i18n is still empty`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) fail(`${L.code}: duplicate ids ${[...new Set(dup)].join(", ")}`);

  const file = path.join(OUT, L.path === "/" ? "index.html" : L.path.slice(1), L.path === "/" ? "" : "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  return path.relative(ROOT, file);
}

function runtimeDict(L) {
  const { prefixes, exact } = cfg.runtimeKeys, T = D[L.code], out = {};
  for (const k of Object.keys(T)) if (exact.includes(k) || prefixes.some((p) => k.startsWith(p))) out[k] = T[k];
  const file = path.join(OUT, `assets/js/dict-${L.code}.js`);
  fs.writeFileSync(file, `/* generated by tools/build.mjs — do not edit */\nwindow.GD = window.GD || {};\nGD.dict = ${JSON.stringify(out)};\n`);
  return path.relative(ROOT, file);
}

const written = [];
for (const L of cfg.langs) { written.push(render(L)); written.push(runtimeDict(L)); }
const put = (name, body) => { fs.writeFileSync(path.join(OUT, name), body); written.push(path.relative(ROOT, path.join(OUT, name))); };
put("sitemap.xml", sitemap(cfg, LASTMOD));
put("robots.txt", robots(cfg));
put("llms.txt", llms(cfg, D));
put("llms-full.txt", llmsFull(cfg, D));

// CNAME is for custom domains only. A *.github.io address must not ship one; a custom domain must.
// So moving to your own domain later is a one-line change of "url" in src/site.json.
const HOST = new URL(cfg.url).hostname;
if (HOST.endsWith(".github.io")) fs.rmSync(path.join(OUT, "CNAME"), { force: true });
else put("CNAME", HOST);

// keys that no template uses and that the runtime does not load are dead weight
const { prefixes, exact } = cfg.runtimeKeys;
const dead = baseKeys.filter((k) => !used.has(k) && !exact.includes(k) && !prefixes.some((p) => k.startsWith(p)) && !k.startsWith("ld.") && !k.startsWith("meta."));
if (dead.length) console.warn("warning: unused keys:", dead.join(", "));

console.log(written.map((f) => "  " + f).join("\n"));
if (problems.length) { console.error("\nBUILD FAILED:\n - " + [...new Set(problems)].join("\n - ")); process.exit(1); }
console.log(`\nOK — ${cfg.langs.length} pages, lastmod ${LASTMOD}${opt("--out") ? ", output: " + OUT : ""}`);
