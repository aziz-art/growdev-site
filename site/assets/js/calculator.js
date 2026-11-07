/* GrowDev — time-saving simulator. Everything runs in the browser; nothing is stored or sent. */
(function () {
  "use strict";
  var GD = window.GD = window.GD || {};
  var $ = function (s) { return document.querySelector(s); };
  var WEEKS = 4.33, FTE_MONTH = 160;

  GD.calculator = {
    init: function () {
      var form = $("#sim-form");
      if (!form) return;
      var people = $("#s-people"), hours = $("#s-hours"), share = $("#s-share"), rate = $("#s-rate"), cur = $("#s-cur");
      var oP = $("#o-people"), oH = $("#o-hours"), oS = $("#o-share");
      var rV = $("#r-value"), rH = $("#r-hours"), rD = $("#r-days");
      var bars = Array.prototype.slice.call(document.querySelectorAll("#sbars i"));
      var shown = { v: 0, h: 0, d: 0 }, target = { v: 0, h: 0, d: 0 }, raf = 0, dirty = false;
      var t = GD.i18n.t, cfg = GD.config;

      cur.value = cfg.defaultCurrency;
      rate.value = cfg.hourlyCost[cur.value];

      // ICU separates thousands with a narrow no-break space; a regular no-break space reads better at display size
      function nf(o) { var f = new Intl.NumberFormat(GD.i18n.numLocale(), o); return { format: function (v) { return f.format(v).replace(/\u202f/g, "\u00a0"); } }; }
      // "10 912 DT", "10 912 د.ت", "€10,912": the pattern for each currency lives in the language dictionary
      function money(v) { return t("curfmt." + cur.value, { n: nf({ maximumFractionDigits: 0 }).format(Math.round(v)) }); }
      function paintNumbers() {
        rV.textContent = money(shown.v);
        rH.textContent = nf({ maximumFractionDigits: 0 }).format(shown.h);
        rD.textContent = nf({ minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(shown.d);
      }
      function tween() {
        var k = 0.22, done = true;
        ["v", "h", "d"].forEach(function (key) {
          var diff = target[key] - shown[key];
          if (Math.abs(diff) > Math.max(0.05, Math.abs(target[key]) * 0.002)) { shown[key] += diff * k; done = false; } else { shown[key] = target[key]; }
        });
        paintNumbers();
        raf = done ? 0 : requestAnimationFrame(tween);
      }
      function paintInputs() {
        [people, hours, share].forEach(function (el) {
          el.style.setProperty("--fill", ((el.value - el.min) / (el.max - el.min) * 100) + "%");
        });
        oP.textContent = people.value;
        oH.textContent = t("sim.h", { n: hours.value });
        oS.textContent = t("sim.pct", { n: share.value });
      }
      function compute() {
        var perMonth = (+people.value) * (+hours.value) * (+share.value / 100) * WEEKS;
        var cost = Math.max(0, +rate.value || 0);
        target = { h: perMonth, d: perMonth / 8, v: perMonth * 12 * cost };
        bars.forEach(function (b, i) {
          // cumulative hours freed after month i+1, as a share of one full-time job (160 h x 12 months)
          b.style.setProperty("--v", Math.min(1, perMonth * (i + 1) / (FTE_MONTH * 12)).toFixed(3));
        });
        paintInputs();
        if (GD.reduceMotion) { shown = { v: target.v, h: target.h, d: target.d }; paintNumbers(); }
        else if (!raf) raf = requestAnimationFrame(tween);
      }

      form.addEventListener("submit", function (e) { e.preventDefault(); });
      [people, hours, share].forEach(function (el) { el.addEventListener("input", compute); });
      rate.addEventListener("input", function () { dirty = true; compute(); });
      cur.addEventListener("change", function () {
        if (!dirty) rate.value = cfg.hourlyCost[cur.value];
        compute(); shown.v = target.v; paintNumbers();
      });
      compute();
    }
  };
})();
