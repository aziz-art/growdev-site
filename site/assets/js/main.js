/* GrowDev — boot */
(function () {
  "use strict";
  function boot() {
    var GD = window.GD;
    GD.hero.init();
    GD.ui.init();
    GD.composer.init();
    GD.calculator.init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
