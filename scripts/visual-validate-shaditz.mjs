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
      // Wait for fonts to load
      await page.evaluate(async () => {
        await document.fonts.ready;
      });

      // Let the cinematic loader + initial animations settle.
      await page.waitForTimeout(3500);

      // Force hide loader just in case
      await page.evaluate(() => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
      });

      // Hide cursor and freeze animations for screenshot comparison
      await page.addStyleTag({
        content: `
          *, *::before, *::after {
            animation-play-state: paused !important;
            caret-color: transparent !important;
          }
          #cur, #cur2 {
            display: none !important;
          }
          body {
            cursor: none !important;
          }
        `,
      });

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

      // Wait a moment for any lazy loads or scroll resets to settle
      await page.waitForTimeout(500);

      // For Next-rendered targets the cinematic page is wrapped in an iframe
      // (RebuiltLandingFrame) sized to 100vh. fullPage screenshots only capture
      // the outer document, so without expanding the iframe we'd compare the
      // first-viewport of the iframe against the full raw page (~23% diff).
      // Expand the iframe to its inner scrollHeight, freeze its inner animations
      // and hide its inner cursor/loader, then screenshot the outer page.
      const iframeExpanded = await page.evaluate(async (viewportH) => {
        const iframe = document.querySelector('iframe[data-shaditz-landing]');
        if (!iframe) return { found: false };
        const doc = iframe.contentDocument;
        const win = iframe.contentWindow;
        if (!doc || !win) return { found: true, accessible: false };
        try { await doc.fonts.ready; } catch {}
        // Hide loader inside iframe
        const innerLoader = doc.getElementById('loader');
        if (innerLoader) innerLoader.style.display = 'none';
        // Hide cursor, freeze animations, AND pin viewport-relative heights so
        // expanding the iframe doesn't make `min-height: 100vh` re-evaluate to
        // the expanded size (which would stretch the hero to fill the whole
        // page and push everything below off the visible box).
        const innerStyle = doc.createElement('style');
        innerStyle.textContent = `
          *, *::before, *::after { animation-play-state: paused !important; caret-color: transparent !important; }
          #cur, #cur2 { display: none !important; }
          body { cursor: none !important; }
          .hero { min-height: ${viewportH}px !important; }
        `;
        doc.head.appendChild(innerStyle);
        doc.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
        doc.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
        await new Promise((r) => requestAnimationFrame(() => r(null)));
        const innerH = Math.max(
          doc.documentElement.scrollHeight,
          doc.body ? doc.body.scrollHeight : 0,
        );
        iframe.style.height = innerH + 'px';
        return { found: true, accessible: true, innerH };
      }, height);
      // Give layout a tick after iframe resize
      await page.waitForTimeout(250);

      const name = `${target.key}-${w}.png`;
      const p = path.join(outDir, name);
      await page.screenshot({ path: p, fullPage: true });

      results.push({
        target: target.key,
        width: w,
        ok: true,
        ms: Date.now() - startedAt,
        screenshot: path.relative(repoRoot, p).replaceAll("\\", "/"),
        iframeExpanded,
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

