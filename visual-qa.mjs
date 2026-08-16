import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

const results = { consoleErrors: [], pageErrors: [], routes: {}, interactions: {} };
const baseUrl = "http://127.0.0.1:3100";
const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });
page.on("console", (message) => {
  if (message.type() === "error") results.consoleErrors.push(message.text());
});
page.on("pageerror", (error) => results.pageErrors.push(error.message));

for (const route of ["/", "/series", "/episodios", "/estrenos", "/finales", "/top-50", "/peliculas", "/peliculas/calendario", "/peliculas/top-50"]) {
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 120000 });
  results.routes[route] = {
    status: response?.status(),
    title: await page.title(),
    overflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
  };
}

await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 120000 });
await page.screenshot({ path: "implementation-desktop.png" });
const seriesPremieres = await page.locator(".premiere-item strong").allTextContents();
await page.locator(".premiere-tabs button").filter({ hasText: "Películas" }).click();
await page.waitForTimeout(250);
const moviePremieres = await page.locator(".premiere-item strong").allTextContents();
results.interactions.premiereTabs = seriesPremieres.join("|") !== moviePremieres.join("|");

await page.goto(`${baseUrl}/estrenos`, { waitUntil: "networkidle", timeout: 120000 });
const monthBefore = await page.locator(".calendar-toolbar h2").textContent();
await page.getByRole("button", { name: "Mes siguiente" }).click();
await page.waitForTimeout(250);
const monthAfter = await page.locator(".calendar-toolbar h2").textContent();
results.interactions.calendarNext = monthBefore !== monthAfter;

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: 120000 });
results.interactions.mobileHasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
await page.screenshot({ path: "implementation-mobile.png" });
await page.getByRole("button", { name: "Abrir navegación" }).click();
await page.waitForTimeout(250);
results.interactions.mobileMenuVisible = await page.locator(".main-nav.is-open").isVisible();
await page.screenshot({ path: "implementation-mobile-menu.png" });

await browser.close();
process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
