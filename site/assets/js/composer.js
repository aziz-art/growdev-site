/* GrowDev — "compose your system": chips -> live map -> phased scope -> e-mail brief */
(function () {
  "use strict";
  var GD = window.GD = window.GD || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";

  var ODOO = ["crm", "sales", "invoicing", "purchase", "inventory", "pos", "manufacturing", "website", "hr"];
  var OTHER = ["audit", "webapp", "wordpress", "prestashop", "mobile", "automation"];
  var ALL = ODOO.concat(OTHER);
  var AB = { crm: "CRM", sales: "SAL", invoicing: "ACC", purchase: "PUR", inventory: "INV", pos: "POS", manufacturing: "MFG", website: "WEB", hr: "HR", audit: "AUD", webapp: "APP", wordpress: "WP", prestashop: "PS", mobile: "MOB", automation: "AUT" };
  // Typical data flows between modules (shown as animated links when both ends are selected)
  var FLOWS = [["crm", "sales"], ["sales", "inventory"], ["sales", "invoicing"], ["purchase", "inventory"], ["purchase", "invoicing"], ["inventory", "manufacturing"], ["website", "sales"], ["pos", "inventory"], ["pos", "invoicing"], ["prestashop", "sales"], ["mobile", "sales"]];
  var CX = 260, CY = 200, RX = 150, RY = 124, R = 17;

  var sel = {}, pos = {}, els = {}, flowEls = {}, raf = 0, hintId = null;

  function t() { return GD.i18n.t.apply(null, arguments); }
  function label(id) { return t("mod." + id); }
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function chosen(list) { return list.filter(function (id) { return sel[id]; }); }
  function lines(text) {
    if (text.length <= 11 || text.indexOf(" ") < 0) return [text];
    var w = text.split(" "), best = 1, diff = 1e9;
    for (var i = 1; i < w.length; i++) {
      var d = Math.abs(w.slice(0, i).join(" ").length - w.slice(i).join(" ").length);
      if (d < diff) { diff = d; best = i; }
    }
    return [w.slice(0, best).join(" "), w.slice(best).join(" ")];
  }

  /* ---------- map ---------- */
  function targets() {
    var ids = ALL.filter(function (id) { return sel[id]; }), n = ids.length, out = {};
    ids.forEach(function (id, i) {
      var a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / n - (n > 1 ? 0 : 0);
      out[id] = { x: CX + RX * Math.cos(a), y: CY + RY * Math.sin(a), a: a };
    });
    return out;
  }

  function placeLabel(id) {
    var e = els[id], p = pos[id], c = Math.cos(p.a), s = Math.sin(p.a), ls = lines(label(id));
    while (e.label.firstChild) e.label.removeChild(e.label.firstChild);
    var side = Math.abs(c) > 0.35, anchor = side ? (c > 0 ? "start" : "end") : "middle";
    e.label.setAttribute("text-anchor", anchor);
    var x = side ? (c > 0 ? R + 7 : -R - 7) : 0, y0, lh = GD.i18n.rtl ? 16 : 13; // Arabic glyphs need more line height
    if (side) y0 = 4 - (ls.length - 1) * lh / 2; else y0 = s < 0 ? -R - 9 - (ls.length - 1) * lh : R + 17;
    ls.forEach(function (l, i) {
      var ts = svg("tspan", { x: x, y: y0 + i * lh }, e.label); ts.textContent = l;
    });
  }

  function ensure(id) {
    if (els[id]) return;
    var g = svg("g", { "class": "mnode" + (OTHER.indexOf(id) > -1 ? " is-other" : "") }, $("#map-nodes"));
    var link = svg("line", { "class": "mlink", x1: CX, y1: CY, x2: CX, y2: CY }, $("#map-links"));
    svg("circle", { r: R }, g);
    var ab = svg("text", { "class": "ab" }, g); ab.textContent = AB[id];
    var lab = svg("text", {}, g);
    els[id] = { g: g, link: link, label: lab };
    pos[id] = pos[id] || { x: CX, y: CY, tx: CX, ty: CY, a: 0 };
  }

  function drop(id) {
    if (!els[id]) return;
    els[id].g.remove(); els[id].link.remove(); delete els[id]; delete pos[id];
  }

  function syncFlows() {
    FLOWS.forEach(function (f) {
      var k = f.join(">"), on = sel[f[0]] && sel[f[1]];
      if (on && !flowEls[k]) flowEls[k] = svg("path", { "class": "mflow" }, $("#map-flows"));
      if (!on && flowEls[k]) { flowEls[k].remove(); delete flowEls[k]; }
    });
  }

  function paint() {
    ALL.forEach(function (id) {
      var e = els[id], p = pos[id];
      if (!e) return;
      e.g.setAttribute("transform", "translate(" + p.x.toFixed(1) + " " + p.y.toFixed(1) + ")");
      e.link.setAttribute("x2", p.x.toFixed(1)); e.link.setAttribute("y2", p.y.toFixed(1));
    });
    FLOWS.forEach(function (f) {
      var el = flowEls[f.join(">")], a = pos[f[0]], b = pos[f[1]];
      if (!el || !a || !b) return;
      var mx = (a.x + b.x) / 2 + (CX - (a.x + b.x) / 2) * 0.45, my = (a.y + b.y) / 2 + (CY - (a.y + b.y) / 2) * 0.45;
      el.setAttribute("d", "M" + a.x.toFixed(1) + " " + a.y.toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + b.x.toFixed(1) + " " + b.y.toFixed(1));
    });
  }

  function step() {
    var moving = false;
    ALL.forEach(function (id) {
      var p = pos[id]; if (!p) return;
      var dx = p.tx - p.x, dy = p.ty - p.y;
      if (Math.abs(dx) > 0.2 || Math.abs(dy) > 0.2) { p.x += dx * 0.2; p.y += dy * 0.2; moving = true; } else { p.x = p.tx; p.y = p.ty; }
    });
    paint();
    raf = moving ? requestAnimationFrame(step) : 0;
  }

  function renderMap() {
    var tg = targets();
    ALL.forEach(function (id) { if (!tg[id]) drop(id); });
    Object.keys(tg).forEach(function (id) {
      ensure(id);
      var p = pos[id]; p.tx = tg[id].x; p.ty = tg[id].y; p.a = tg[id].a;
      placeLabel(id);
    });
    syncFlows();
    $("#sys-map").setAttribute("data-empty", String(Object.keys(tg).length === 0));
    if (GD.reduceMotion) { Object.keys(pos).forEach(function (id) { pos[id].x = pos[id].tx; pos[id].y = pos[id].ty; }); paint(); }
    else if (!raf) raf = requestAnimationFrame(step);
  }

  /* ---------- summary + brief ---------- */
  function names(list) { return list.map(label).join(t("sim.list")); }
  function plan() {
    var odoo = chosen(ODOO), other = chosen(OTHER);
    return { odoo: odoo, other: other, p1: odoo.slice(0, 3), p2: odoo.slice(3), n: odoo.length + other.length };
  }

  function renderSummary() {
    var s = plan();
    $("#sum-count").textContent = s.n === 0 ? t("sum.empty") : GD.i18n.count("sum", s.n);
    var box = $("#sum-phases"); box.textContent = "";
    function row(k, list) {
      if (!list.length) return;
      var d = document.createElement("div"); d.className = "phase";
      var b = document.createElement("b"); b.textContent = t(k);
      var sp = document.createElement("span"); sp.textContent = names(list);
      d.appendChild(b); d.appendChild(sp); box.appendChild(d);
    }
    row("phase.1", s.p1); row("phase.2", s.p2); row("phase.par", s.other);
  }

  function buildBrief() {
    var f = $("#brief").elements, s = plan(), L = [t("brief.hello"), "", t("brief.intro"), ""];
    if (s.odoo.length) L.push(t("brief.odoo", { list: names(s.odoo) }));
    if (s.other.length) L.push(t("brief.other", { list: names(s.other) }));
    if (s.odoo.length) {
      L.push("", t("brief.split"), t("brief.p1", { list: names(s.p1) }));
      if (s.p2.length) L.push(t("brief.p2", { list: names(s.p2) }));
      if (s.other.length) L.push(t("brief.par", { list: names(s.other) }));
    }
    var company = f.company.value.trim(), name = f.name.value.trim(), msg = f.msg.value.trim();
    if (f.when.value) L.push("", t("brief.when", { when: f.when.options[f.when.selectedIndex].text }));
    if (company) L.push(t("brief.company", { company: company }));
    if (msg) L.push("", msg);
    L.push("", t("brief.bye"), name);
    return { subject: company ? t("brief.subject.co", { company: company }) : t("brief.subject"), body: L.join("\n") };
  }

  function status(key) { $("#brief-status").textContent = key ? t(key) : ""; }

  function copyText(txt) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt);
    return new Promise(function (ok, ko) {
      try {
        var ta = document.createElement("textarea"); ta.value = txt; ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select();
        var done = document.execCommand("copy"); ta.remove(); done ? ok() : ko();
      } catch (e) { ko(e); }
    });
  }

  /* ---------- chips ---------- */
  function setHint(id) {
    hintId = id;
    $("#chip-hint").textContent = id ? t("hint." + id) : t("comp.hint");
  }
  function toggle(id, on) {
    sel[id] = on == null ? !sel[id] : on;
    var b = $('.chip[data-mod="' + id + '"]'); if (b) b.setAttribute("aria-pressed", String(!!sel[id]));
    renderMap(); renderSummary(); status("");
  }

  GD.composer = {
    pick: function (id) { if (ALL.indexOf(id) > -1) { toggle(id, true); setHint(id); } },
    init: function () {
      if (!$("#brief")) return;
      $$(".chip").forEach(function (b) {
        var id = b.getAttribute("data-mod");
        b.addEventListener("click", function () { toggle(id); setHint(id); });
        b.addEventListener("mouseenter", function () { setHint(id); });
        b.addEventListener("focus", function () { setHint(id); });
        b.addEventListener("mouseleave", function () { setHint(hintId && sel[hintId] ? hintId : null); });
      });
      $$("a[data-pick]").forEach(function (a) {
        a.addEventListener("click", function () { GD.composer.pick(a.getAttribute("data-pick")); });
      });
      $("#brief").addEventListener("submit", function (e) {
        e.preventDefault();
        if (!plan().n) { status("brief.empty"); var c = $(".chip"); if (c) c.focus(); return; }
        var b = buildBrief();
        status("brief.opened");
        window.location.href = "mailto:" + GD.config.email + "?subject=" + encodeURIComponent(b.subject) + "&body=" + encodeURIComponent(b.body);
      });
      $("#copy-brief").addEventListener("click", function () {
        if (!plan().n) { status("brief.empty"); return; }
        copyText(buildBrief().body).then(function () { status("brief.copied"); }, function () { status("brief.copyfail"); });
      });
      renderMap(); renderSummary();
    }
  };
})();
