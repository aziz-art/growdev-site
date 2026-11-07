/* GrowDev — 404 page: show the message in the visitor's language.
   Order: language in the URL (/ar/..., /en/...), then a language chosen earlier with the switcher, then the browser language. */
(function () {
  "use strict";
  var d = document.documentElement, LANGS = ["fr", "ar", "en"];
  var TITLE = { fr: "Page introuvable | GrowDev", ar: "الصفحة غير موجودة | GrowDev", en: "Page not found | GrowDev" };
  var HOME = { fr: "GrowDev, retour à l’accueil", ar: "GrowDev، العودة إلى الصفحة الرئيسية", en: "GrowDev, back to the homepage" };

  function pick() {
    var m = location.pathname.match(/^\/(ar|en)(\/|$)/);
    if (m) return m[1];
    try {
      var s = localStorage.getItem("gd-lang");
      if (LANGS.indexOf(s) > -1) return s;
    } catch (e) { /* storage blocked */ }
    var n = ((navigator.languages && navigator.languages[0]) || navigator.language || "").slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) > -1 ? n : "fr";
  }

  var L = pick();
  d.lang = L;
  d.dir = L === "ar" ? "rtl" : "ltr";
  document.title = TITLE[L];
  document.getElementById("brand").setAttribute("aria-label", HOME[L]);
  Array.prototype.forEach.call(document.querySelectorAll(".nf-lang"), function (b) { b.hidden = b.getAttribute("lang") !== L; });
  Array.prototype.forEach.call(document.querySelectorAll(".nf-langs a"), function (a) {
    if (a.getAttribute("hreflang") === L) a.setAttribute("aria-current", "true");
  });
})();
