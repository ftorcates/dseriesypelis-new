import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const source = readFileSync("/Users/freddytorcates/.codex/generated_images/019fdffd-127f-7282-a771-233eb0b679b2/exec-ac680eea-b7d3-4ce7-84df-7866576d382c.png").toString("base64");
const implementation = readFileSync("implementation-desktop.png").toString("base64");
const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 2880, height: 1024 }, deviceScaleFactor: 1 });
await page.setContent(`
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; width: 2880px; height: 1024px; display: grid; grid-template-columns: 1fr 1fr; background: #ddd; }
    figure { position: relative; width: 1440px; height: 1024px; margin: 0; overflow: hidden; background: #f5f1e8; border-right: 2px solid #111; }
    img { width: 100%; height: 100%; display: block; object-fit: contain; }
    figcaption { position: absolute; top: 0; left: 0; z-index: 2; padding: 8px 12px; color: white; background: #073fe2; font: 700 14px Arial; letter-spacing: .08em; }
  </style>
  <figure><figcaption>REFERENCIA</figcaption><img src="data:image/png;base64,${source}"></figure>
  <figure><figcaption>IMPLEMENTACIÓN</figcaption><img src="data:image/png;base64,${implementation}"></figure>
`);
await page.screenshot({ path: "comparison-desktop.png" });
await browser.close();
