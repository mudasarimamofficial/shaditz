import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const widths = [1440, 1280, 768, 375, 320];
const height = 900;

const repoRoot = process.cwd();
const outDir = path.join(repoRoot, "artifacts", "visual-validation", "shaditz");
await mkdir(outDir, { recursive: true });

const rawHtmlPath = path.join(repoRoot, "public", "shaditz-rebuilt-1.html");
const rawUrl = pathToFileURL(rawHtmlPath).toString();

const targets = [
  { key: "raw", label: "Raw HTML", url: rawUrl },
  { key: "local", label: "Local app", url: "http://localhost:3000/" },
  { key: "prod", label: "Production", url: "https://shaditz.vercel.app/" },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 1,
});

const results = [];

for (const target of targets) {
  for (const w of widths) {
    const page = await context.newPage();
    await page.setViewportSize({ width: w, height });
    await page.addInitScript(() => {
      try {
        history.scrollRestoration = "manual";
      } catch {}
    });

    const startedAt = Date.now();
    try {
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      // Let the cinematic loader + initial animations settle.
      await page.waitForTimeout(2600);
      // Force scroll to top (Next dev sometimes restores scroll).
      for (let i = 0; i < 8; i++) {
        const y = await page.evaluate(() => {
          try {
            document.documentElement.style.scrollBehavior = "auto";
          } catch {}
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          return window.scrollY || 0;
        });
        if (y === 0) break;
        await page.waitForTimeout(120);
      }

      const name = `${target.key}-${w}.png`;
      const p = path.join(outDir, name);
      await page.screenshot({ path: p, fullPage: true });

      results.push({
        target: target.key,
        width: w,
        ok: true,
        ms: Date.now() - startedAt,
        screenshot: path.relative(repoRoot, p).replaceAll("\\", "/"),
      });
    } catch (e) {
      results.push({
        target: target.key,
        width: w,
        ok: false,
        ms: Date.now() - startedAt,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      await page.close();
    }
  }
}

await writeFile(path.join(outDir, "results.json"), JSON.stringify({ widths, height, targets, results }, null, 2));
await browser.close();

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  // Non-zero exit so CI / human notices.
  process.exitCode = 1;
}

