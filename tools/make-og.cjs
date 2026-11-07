// Regenerates the three social share images (site/assets/img/og-fr.jpg, og-ar.jpg, og-en.jpg) from tools/og.html.
// Needs: npm i playwright && npx playwright install chromium     Run: node tools/make-og.cjs
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
(async () => {
  const out = path.join(__dirname, "..", "site", "assets", "img");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  for (const lang of ["fr", "ar", "en"]) {
    await page.goto("file://" + path.join(__dirname, "og.html") + "?lang=" + lang);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    const file = path.join(out, `og-${lang}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 92 }); // JPEG: ~120 KB instead of ~470 KB, so WhatsApp and LinkedIn previews load reliably
    console.log(`og-${lang}.jpg written (${Math.round(fs.statSync(file).size / 1024)} KB)`);
  }
  await browser.close();
})();
