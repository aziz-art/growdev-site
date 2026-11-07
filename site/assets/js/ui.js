/* GrowDev — page behaviour: header, menu, reveal, service cards, method timeline */
(function () {
  "use strict";
  var GD = window.GD = window.GD || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (n, a, b) { return Math.max(a, Math.min(b, n)); };

  /* ---------- header: blur on scroll, progress arrow, active link ---------- */
  function header() {
    var h = $(".site-header"), bar = $(".progress");
    var links = $$('.nav a[href^="#"]:not(.nav__cta)');
    var secs = links.map(function (a) { return $(a.getAttribute("href")); });
    var ticking = false;
    function update() {
      ticking = false;
      var y = window.scrollY || 0, max = document.documentElement.scrollHeight - window.innerHeight;
      h.classList.toggle("is-scrolled", y > 8);
      bar.style.setProperty("--p", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
      var cur = -1, line = y + 160;
      secs.forEach(function (s, i) { if (s && s.offsetTop <= line) cur = i; });
      links.forEach(function (a, i) { i === cur ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- mobile menu ---------- */
  function menu() {
    var btn = $(".menu-btn"), nav = $("#menu");
    function set(open) {
      btn.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) set(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("is-open")) { set(false); btn.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 900) set(false); });
  }

  /* ---------- reveal on scroll ---------- */
  function reveal() {
    var els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || GD.reduceMotion) { els.forEach(function (e) { e.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("is-in"); io.unobserve(x.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- service cards: pointer spotlight, live illustrations, jump highlight ---------- */
  function services() {
    var cards = $$(".svc");
    cards.forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    });
    if ("IntersectionObserver" in window && !GD.reduceMotion) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (x) { x.target.classList.toggle("is-live", x.isIntersecting); });
      }, { threshold: 0.35 });
      cards.forEach(function (c) { io.observe(c); });
    }
    function highlight(id) {
      var el = id && document.getElementById(id);
      if (!el || !el.classList.contains("svc")) return;
      setTimeout(function () {
        el.classList.remove("is-hl"); void el.offsetWidth; el.classList.add("is-hl");
        setTimeout(function () { el.classList.remove("is-hl"); }, 1900);
      }, 450);
    }
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#svc-"]');
      if (a) highlight(a.getAttribute("href").slice(1));
    });
    if (location.hash.indexOf("#svc-") === 0) highlight(location.hash.slice(1));
  }

  /* ---------- method timeline: arrow path drawn with scroll ---------- */
  function method() {
    var box = $("#steps"), svg = $("#method-svg");
    if (!box || !svg) return;
    var steps = $$(".step", box), track = $(".track", svg), fill = $(".fill", svg);
    var len = 0, marks = [], desktop = true, ticking = false, rtl = GD.i18n.rtl;

    function layout() {
      desktop = window.innerWidth > 900;
      var b = box.getBoundingClientRect(), pts = [];
      marks = steps.map(function (s) {
        var n = $(".step__node", s).getBoundingClientRect();
        var x = n.left - b.left + n.width / 2, y = n.top - b.top + n.height / 2;
        pts.push([x, y]);
        // progress runs along the reading direction: left to right in French and English, right to left in Arabic
        return desktop ? (rtl ? 1 - x / b.width : x / b.width) : y / b.height;
      });
      if (desktop) {
        pts.push([rtl ? 0 : b.width, pts[pts.length - 1][1] - 30]);
        svg.setAttribute("viewBox", "0 0 " + b.width + " " + b.height);
        var d = GD.geom.smooth(pts);
        track.setAttribute("d", d); fill.setAttribute("d", d);
        len = fill.getTotalLength();
        fill.style.strokeDasharray = len;
      }
      update();
    }
    function update() {
      ticking = false;
      var b = box.getBoundingClientRect(), vh = window.innerHeight;
      var p = GD.reduceMotion ? 1 : clamp((vh * 0.72 - b.top) / (desktop ? vh * 0.5 : b.height), 0, 1);
      box.style.setProperty("--p", p.toFixed(4));
      if (desktop) fill.style.strokeDashoffset = len * (1 - p);
      steps.forEach(function (s, i) { s.classList.toggle("is-on", p >= marks[i] - 0.02 || GD.reduceMotion); });
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", layout);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  }

  /* ---------- language links: remember a deliberate choice (see boot.js) ---------- */
  function lang() {
    $$(".lang a[data-lang]").forEach(function (a) {
      a.addEventListener("click", function () {
        try { localStorage.setItem("gd-lang", a.getAttribute("data-lang")); } catch (e) { /* storage blocked */ }
      });
    });
  }

  GD.ui = {
    init: function () {
      header(); menu(); lang(); reveal(); services(); method();
      var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    }
  };
})();
