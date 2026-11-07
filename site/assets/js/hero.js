/* GrowDev — hero: rising arrow drawn over the service bars + ambient growth canvas */
(function () {
  "use strict";
  var GD = window.GD = window.GD || {};
  var reduce = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  GD.reduceMotion = reduce;

  function r(n) { return Math.round(n * 10) / 10; }

  /* Catmull-Rom points -> smooth cubic Bezier path (shared with the method timeline) */
  function smooth(p, k) {
    k = k == null ? 1 : k;
    var d = "M" + r(p[0][0]) + " " + r(p[0][1]);
    for (var i = 0; i < p.length - 1; i++) {
      var p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += " C" + r(p1[0] + (p2[0] - p0[0]) / 6 * k) + " " + r(p1[1] + (p2[1] - p0[1]) / 6 * k) + " " +
        r(p2[0] - (p3[0] - p1[0]) / 6 * k) + " " + r(p2[1] - (p3[1] - p1[1]) / 6 * k) + " " + r(p2[0]) + " " + r(p2[1]);
    }
    return d;
  }
  GD.geom = { smooth: smooth, r: r };

  function layoutArrow() {
    var chart = document.querySelector(".growth");
    var svg = document.getElementById("growth-arrow");
    if (!chart || !svg) return;
    var path = svg.querySelector(".arrow__path"), head = svg.querySelector(".arrow__head");
    var cr = chart.getBoundingClientRect();
    if (!cr.width) return;
    svg.setAttribute("viewBox", "0 0 " + cr.width + " " + cr.height);
    var ul = chart.querySelector(".growth__bars").getBoundingClientRect();
    var pts = [[-6, ul.bottom - cr.top - 14]];
    chart.querySelectorAll(".growth__bars li").forEach(function (li) {
      var b = li.getBoundingClientRect();
      pts.push([b.left - cr.left + b.width / 2, b.top - cr.top - 18]);
    });
    var last = pts[pts.length - 1];
    var end = [last[0] + Math.min(34, cr.width * 0.06), last[1] - Math.min(40, cr.height * 0.09)];
    var a = Math.atan2(end[1] - last[1], end[0] - last[0]), ux = Math.cos(a), uy = Math.sin(a), nx = -uy, ny = ux;
    pts.push([end[0] - ux * 8, end[1] - uy * 8]);
    path.setAttribute("d", smooth(pts));
    path.style.setProperty("--len", Math.ceil(path.getTotalLength()) + 2);
    var tip = [end[0] + ux * 6, end[1] + uy * 6], bx = end[0] - ux * 16, by = end[1] - uy * 16;
    head.setAttribute("d", "M" + r(tip[0]) + " " + r(tip[1]) + " L" + r(bx + nx * 11) + " " + r(by + ny * 11) +
      " L" + r(end[0] - ux * 8) + " " + r(end[1] - uy * 8) + " L" + r(bx - nx * 11) + " " + r(by - ny * 11) + " Z");
  }

  function ambient() {
    var cv = document.getElementById("fx");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d"), hero = cv.parentElement;
    var W = 0, H = 0, dpr = 1, bars = [], sparks = [], grid = null;
    var px = -1, sx = -1, t = 0, last = 0, running = false;
    var COLORS = ["47,229,106", "0,186,252", "242,178,48"];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(12, Math.min(38, Math.round(W / 42)));
      bars = [];
      for (var i = 0; i < n; i++) {
        var f = i / (n - 1);
        bars.push({ x: (i + 0.5) * W / n, w: W / n * 0.56, h: H * (0.14 + 0.5 * f) * (0.72 + 0.28 * Math.abs(Math.sin(i * 12.9898))), ph: i * 0.7 });
      }
      grid = document.createElement("canvas");
      grid.width = W * dpr; grid.height = H * dpr;
      var g = grid.getContext("2d"); g.scale(dpr, dpr);
      g.strokeStyle = "rgba(120,170,220,.08)"; g.lineWidth = 1;
      for (var x = 0; x < W; x += 72) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
      for (var y = H; y > 0; y -= 72) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); g.stroke(); }
      var m = g.createLinearGradient(0, 0, 0, H);
      m.addColorStop(0, "rgba(0,0,0,0)"); m.addColorStop(1, "rgba(0,0,0,1)");
      g.globalCompositeOperation = "destination-in"; g.fillStyle = m; g.fillRect(0, 0, W, H);
    }

    function draw(dt) {
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(grid, 0, 0, W, H);
      sx += (px - sx) * Math.min(1, dt * 6);
      for (var i = 0; i < bars.length; i++) {
        var b = bars[i];
        var boost = px < 0 ? 0 : Math.max(0, 1 - Math.abs(b.x - sx) / (W * 0.16));
        var h = b.h * (1 + 0.035 * Math.sin(t * 0.9 + b.ph) + 0.22 * boost);
        ctx.fillStyle = "rgba(47,229,106," + (0.05 + 0.07 * boost) + ")";
        ctx.fillRect(b.x - b.w / 2, H - h, b.w, h);
        ctx.fillStyle = "rgba(47,229,106," + (0.22 + 0.3 * boost) + ")";
        ctx.fillRect(b.x - b.w / 2, H - h, b.w, 2);
      }
      if (dt > 0 && sparks.length < 26 && Math.random() < dt * 7) {
        var s = bars[(Math.random() * bars.length) | 0];
        sparks.push({ x: s.x, y: H - s.h, vx: (Math.random() - 0.3) * 12, vy: -(14 + Math.random() * 30), life: 0, max: 2.4 + Math.random() * 2, c: COLORS[(Math.random() * 3) | 0], r: 1 + Math.random() * 1.8 });
      }
      for (var j = sparks.length - 1; j >= 0; j--) {
        var p = sparks[j]; p.life += dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.life >= p.max) { sparks.splice(j, 1); continue; }
        ctx.fillStyle = "rgba(" + p.c + "," + (Math.sin(Math.PI * p.life / p.max) * 0.85) + ")";
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }
    }

    function frame(ts) {
      if (!running) return;
      var dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts; t += dt;
      draw(dt);
      requestAnimationFrame(frame);
    }
    function start() { if (running || reduce) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
    function stop() { running = false; }

    build(); draw(0);
    if (reduce) return;
    hero.addEventListener("pointermove", function (e) {
      var b = hero.getBoundingClientRect(); px = e.clientX - b.left; if (sx < 0) sx = px;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { px = -1; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { en[0].isIntersecting ? start() : stop(); }, { threshold: 0 }).observe(hero);
    } else { start(); }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { build(); draw(0); }, 150); });
  }

  GD.hero = {
    init: function () {
      layoutArrow();
      ambient();
      var t;
      window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(layoutArrow, 120); });
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutArrow);
    }
  };
})();
