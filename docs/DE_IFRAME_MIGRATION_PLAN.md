# De-iframe Migration Plan — Shaditz Landing

**Status:** Proposed (not yet implemented)
**Owner decision:** "Plan first, don't touch yet" (2026-06-26)
**Audit refs:** #13 (iframe nested scrollbar), #18 (content trapped in iframe — top GEO priority), #19 (`<main>` landmark)
**Memory refs:** `T-001` (architecture), `K-001` (identity), SEO/GEO layer

---

## 1. Problem (confirmed in code)

The public landing renders entirely inside a sandboxed `srcDoc` iframe:

- [`src/app/page.tsx`](../src/app/page.tsx) reads `public/shaditz-rebuilt-1.html` and passes it as `templateHtml`.
- [`src/components/landing/HomepageClient.tsx`](../src/components/landing/HomepageClient.tsx) renders [`RebuiltLandingFrame`](../src/components/landing/RebuiltLandingFrame.tsx).
- `RebuiltLandingFrame` builds a `srcDoc` = **static template HTML** + an injected `bootstrap` `<script>` (lines 75–706). The bootstrap defines `q`, `qa`, `renderNav`, `renderHero`, `renderAbout`, … and calls `applyContent(window.__SHADITZ_INITIAL__)` **client-side, inside the iframe** (line 704).

### Why this breaks SEO/GEO
1. The **top-level document body is effectively empty** — the real markup lives in the iframe's `srcDoc` attribute, which search engines and LLM retrievers do **not** index as part of the parent page.
2. Even within the iframe, the *initial* HTML carries **placeholder** copy (`SHADITZ`, "ADD YOUR PHOTO HERE", `your@email.com`). Real content only appears **after the iframe's JS executes** `applyContent`. Non-JS crawlers see placeholders.
3. No `<main>` landmark on the host document; nested iframe scrollbar (a11y + polish issue).

The JSON-LD shipped in `7374d7c` mitigates the *entity* signal for AI engines, but the **human-readable body content is still not crawlable**. That is what this migration fixes.

---

## 2. Goal

Render the **fully-populated** landing HTML directly in the primary document DOM (server-side), so crawlers/LLMs get complete content with zero JS execution — **without changing the visual output or the admin builder's live-preview workflow.**

---

## 3. Strategy A — Server-apply + inline render (RECOMMENDED)

Reuse the existing template + the existing render transform, but move the "apply content → HTML" step to the **server**, and render the result inline (no iframe) on the public route. Keep the iframe **only** for the admin builder preview.

### Why this is the low-risk path
- **Identical visual output** — same `public/shaditz-rebuilt-1.html` markup + CSS. No component rewrite, so no risk of pixel regressions.
- **Reuses the proven transform** — the bootstrap's `applyContent` logic already knows how to map `content` → DOM. We port it to run against a server DOM.
- **Builder untouched** — the risky `postMessage` live-preview path stays on the iframe for `/admin` and `?builderPreview=true`. Only the public render changes.

### Architecture after migration

```
PUBLIC ROUTE (/)                          ADMIN BUILDER (unchanged)
  page.tsx (server)                          ShaditzVisualBuilderPanel
    └ applyShaditzContent(template, content) → RebuiltLandingFrame (iframe + postMessage)
        → fully-populated HTML string           (live isolated preview only)
    └ <LandingShell> (server component)
        ├ <main dangerouslySetInnerHTML=populatedHtml />
        └ <LandingInteractivity/> (client: cursor, loader,
            reveal, hamburger, smooth-scroll, contact submit)
```

### Steps

1. **Extract the transform into a shared, DOM-library-agnostic module.**
   - New file: `src/utils/landing/applyShaditzContent.ts`.
   - Port the bootstrap render functions (`renderNav`, `renderHero`, `renderShowreel`, `renderAbout`, `renderServices`, `renderPortfolio`, `renderProcess`, `renderReviews`, `renderTools`, `renderContact`, `renderFooter`, `renderWhatsapp`) into TS functions that operate on a `Document` passed in.
   - These already use only `querySelector`, `textContent`, `innerHTML`, `setAttribute` — all supported by [`linkedom`](https://github.com/WebReflection/linkedom) (lightweight, server-safe, ~no native deps).
   - Signature: `applyShaditzContent(templateHtml: string, content: HomepageContent): string` → parse with linkedom, run the render pipeline, serialize back to an HTML string (body inner + the page's own `<style>`).

2. **Add `linkedom` dependency.** `npm i linkedom` (pure JS, Vercel-safe, no edge incompatibility — runs in the Node runtime, which the `/` route already uses via `force-dynamic`).

3. **Create the public shell.**
   - New: `src/components/landing/LandingShell.tsx` (server component).
   - Reads `content`, calls `applyShaditzContent`, injects the populated body fragment inside a real `<main>` via `dangerouslySetInnerHTML`.
   - The template's own `<style>` block moves to the document head (or stays inline at top of the fragment — both render identically).

4. **Split interactivity into a tiny client component.**
   - New: `src/components/landing/LandingInteractivity.tsx` (`"use client"`).
   - Move the template's bottom `<script>` (loader, cursor, scroll-reveal, filter buttons, smooth scroll, **mobile hamburger**, contact form submit) into a `useEffect`. It attaches to the now-server-rendered DOM. Use the same delegation already added for the hamburger.
   - Contact submit reuses `bindContactForm` logic (validate → POST `/api/leads`).

5. **Branch the render in `page.tsx` / `HomepageClient`.**
   - Public (`/`, not builder): render `<LandingShell>` (inline, SSR).
   - Builder preview (`?builderPreview=true` and inside `/admin`): keep `<RebuiltLandingFrame>` (iframe + postMessage) exactly as-is.

6. **SEO finishers** (cheap, do alongside):
   - Wrap content in `<main>` (audit #19).
   - Soften `\n`-split headings for the accessible text (keep `<br>` visual, but ensure `aria`/text extraction reads naturally) — optional.

### Files touched
| File | Change |
|---|---|
| `src/utils/landing/applyShaditzContent.ts` | **new** — server transform (ported from bootstrap) |
| `src/components/landing/LandingShell.tsx` | **new** — server inline render with `<main>` |
| `src/components/landing/LandingInteractivity.tsx` | **new** — client effects |
| `src/app/page.tsx` | branch: inline shell for public, iframe for builder |
| `src/components/landing/HomepageClient.tsx` | route interactivity vs iframe |
| `package.json` | add `linkedom` |
| `RebuiltLandingFrame.tsx` | unchanged (still used by builder) |

### Risks & mitigations
- **Transform parity drift** — the iframe bootstrap and the new server transform could diverge. *Mitigation:* port the functions verbatim first (single source: extract to the shared module and have the bootstrap import/inline the same logic if feasible; otherwise snapshot-test both produce identical HTML for the default content).
- **`dangerouslySetInnerHTML` + script handling** — inline `<script>` in the fragment won't execute via innerHTML. *Mitigation:* that's intended — all JS moves to `LandingInteractivity`.
- **linkedom serialization differences** — verify `innerHTML` round-trips the template faithfully (self-closing tags, SVG). *Mitigation:* snapshot test against current iframe output.
- **Custom CSS/JS injection** (`site.customCss/customJs`) — currently injected into the iframe. *Mitigation:* route them through `layout.tsx`'s existing custom-CSS/JS mechanism (already present, lines 112–144) or the shell head.

### Rollback
Single feature flag (`content.site?.renderMode === "inline" | "iframe"`, default keep current) or a one-line branch revert in `page.tsx`. The iframe path remains intact, so rollback is instant.

### Test checklist (before merge)
- [ ] `npm run build` green.
- [ ] View-source of `/` shows real hero/about/services/contact text (not placeholders) **with JS disabled**.
- [ ] `<main>` present; exactly one `<h1>`.
- [ ] JSON-LD still present and valid (Rich Results Test).
- [ ] Mobile hamburger, smooth scroll, loader, cursor, scroll-reveal all work.
- [ ] Contact form submits to `/api/leads` and shows success/error states.
- [ ] Admin builder live preview (iframe) still updates on edit (untouched path).
- [ ] No nested scrollbar; Lighthouse SEO ≥ 95; no console errors.
- [ ] `visual:shaditz` diff (existing script) shows no unintended visual change.

---

## 4. Strategy B — Full React component rewrite (deferred)

Replace the HTML-string template with real React server components (`<Hero>`, `<About>`, `<Services>`, …) reading from `content`. This is the cleanest long-term architecture (true SSR, typed props, no string injection) but is a **large rewrite** of a 745-line renderer + 736-line template and carries real visual-regression risk. **Recommend deferring** until Strategy A proves out the SEO win; revisit if/when the template needs deeper structural changes.

---

## 5. Recommendation

Proceed with **Strategy A**. It delivers the full crawlability/GEO benefit (audit #18, the top SEO priority) with minimal visual risk, reuses the existing transform, keeps the builder preview isolated, and has an instant rollback. Estimated scope: 1 new util + 2 small components + 2 wiring edits + 1 dependency, all behind a build + snapshot verification gate.
