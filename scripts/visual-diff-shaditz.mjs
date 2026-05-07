import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const repoRoot = process.cwd();
const dir = path.join(repoRoot, "artifacts", "visual-validation", "shaditz");
const outDir = path.join(dir, "diffs");
await fs.mkdir(outDir, { recursive: true });

const resultsPath = path.join(dir, "results.json");
const raw = JSON.parse(await fs.readFile(resultsPath, "utf8"));

const widths = raw.widths;
const pairs = [
  { a: "raw", b: "local" },
  { a: "raw", b: "prod" },
];

function fileFor(target, width) {
  return path.join(dir, `${target}-${width}.png`);
}

function loadPng(p) {
  return new Promise((resolve, reject) => {
    fsSync
      .createReadStream(p)
      .on("error", reject)
      .pipe(new PNG())
      .on("parsed", function () {
        resolve(this);
      })
      .on("error", reject);
  });
}

const summary = [];

for (const { a, b } of pairs) {
  for (const w of widths) {
    const aPath = fileFor(a, w);
    const bPath = fileFor(b, w);

    const img1 = await loadPng(aPath);
    const img2 = await loadPng(bPath);

    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);
    console.log(w, "a:", a, img1.width, img1.height, "b:", b, img2.width, img2.height);

    const aCropped = new PNG({ width, height });
    const bCropped = new PNG({ width, height });
    PNG.bitblt(img1, aCropped, 0, 0, width, height, 0, 0);
    PNG.bitblt(img2, bCropped, 0, 0, width, height, 0, 0);

    const out = new PNG({ width, height });
    const diffPixels = pixelmatch(
      aCropped.data,
      bCropped.data,
      out.data,
      width,
      height,
      {
        threshold: 0.1,
        includeAA: true,
      },
    );
    const totalPixels = width * height;
    const diffRatio = totalPixels ? diffPixels / totalPixels : 0;

    const outName = `diff-${a}-vs-${b}-${w}.png`;
    const outPath = path.join(outDir, outName);
    await fs.writeFile(outPath, PNG.sync.write(out));

    summary.push({
      width: w,
      a,
      b,
      diffPixels,
      totalPixels,
      diffRatio,
      diffImage: path.relative(repoRoot, outPath).replaceAll("\\", "/"),
    });
  }
}

await fs.writeFile(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 2));

// Fail if any diff ratio is non-zero (strict pixel-perfect).
const nonZero = summary.filter((s) => s.diffPixels !== 0);
if (nonZero.length) {
  process.exitCode = 1;
}

