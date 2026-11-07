/* GrowDev — runtime strings. Pages are translated at build time (tools/build.mjs);
   this only serves the strings that scripts create on the fly (hints, summary, brief, money). */
(function () {
  "use strict";
  var GD = window.GD = window.GD || {};
  var root = document.documentElement, lang = root.getAttribute("lang") || "fr", dict = GD.dict || {};
  var rules = null;
  try { rules = new Intl.PluralRules(lang); } catch (e) { /* very old browser */ }

  function t(key, vars) {
    var s = dict[key];
    if (s == null) return key;
    return vars ? s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; }) : s;
  }
  // count("sum", 3) -> "sum.few" in Arabic, "sum.other" in French and English; always falls back to "<base>.other"
  function count(base, n) {
    var cat = rules ? rules.select(n) : (n === 1 ? "one" : "other");
    return t(dict[base + "." + cat] != null ? base + "." + cat : base + ".other", { n: n });
  }

  GD.i18n = {
    lang: lang,
    rtl: root.getAttribute("dir") === "rtl",
    t: t,
    count: count,
    // Latin digits with a space between thousands, in every language ("10 912"): unambiguous across Tunisia, Africa and the world
    numLocale: function () { return lang === "en" ? "en-GB" : "fr-TN"; }
  };
})();
