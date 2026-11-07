/* GrowDev — runs first, from <head>. */
(function () {
  var d = document.documentElement;
  d.classList.add("js");
  // A language chosen on purpose with the switcher is remembered, and honoured on the neutral entry page only
  // (never on /ar/ or /en/, which people and search engines reach on purpose).
  try {
    var pref = localStorage.getItem("gd-lang");
    if (d.hasAttribute("data-entry") && pref && pref !== d.getAttribute("lang") && d.getAttribute("data-" + pref) &&
        document.referrer.indexOf(location.origin) !== 0) {
      location.replace(d.getAttribute("data-" + pref) + location.hash);
    }
  } catch (e) { /* storage blocked: stay on this page */ }
})();
