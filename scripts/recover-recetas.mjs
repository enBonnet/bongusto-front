#!/usr/bin/env node
/**
 * Loop 1 — Content rescue (fetch-only).
 * Recovers all recipes + about content from the live site's embedded
 * __NEXT_DATA__ JSON. Raw fidelity first: no transformation here.
 *
 * Resumable: skips ids already fetched successfully.
 * Polite: throttled + retries with backoff.
 *
 * Usage: node scripts/recover-recetas.mjs
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const RECETAS_DIR = join(RAW, "recetas");
const SITEMAP_URL = "https://www.bongusto.net/sitemap.xml";
const ABOUT_URL = "https://www.bongusto.net/acerca";
const DELAY_MS = 300;
const MAX_RETRIES = 4;
const TIMEOUT_MS = 20_000;

mkdirSync(RECETAS_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "bongusto-migration/1.0 (content rescue)" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchWithRetries(url) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchText(url);
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_RETRIES) {
        const backoff = attempt * 1500;
        console.warn(`  retry ${attempt}/${MAX_RETRIES} after ${backoff}ms: ${err.message}`);
        await sleep(backoff);
      }
    }
  }
  throw lastErr;
}

/** Extract pageProps JSON from a Next.js page. */
function extractPageProps(html) {
  const m = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  );
  if (!m) throw new Error("no __NEXT_DATA__ found");
  return JSON.parse(m[1]).props?.pageProps;
}

async function main() {
  console.log("📥 Fetching sitemap…");
  const sitemap = await fetchWithRetries(SITEMAP_URL);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const recetaUrls = urls.filter((u) => /\/receta\/(\d+)\//.test(u));
  writeFileSync(join(RAW, "sitemap-urls.txt"), urls.join("\n") + "\n");
  console.log(`   ${urls.length} urls total, ${recetaUrls.length} recipes`);

  // --- recipes ---
  let ok = 0,
    skipped = 0,
    failed = [];
  for (const url of recetaUrls) {
    const id = url.match(/\/receta\/(\d+)\//)[1];
    const out = join(RECETAS_DIR, `${id}.json`);
    if (existsSync(out)) {
      skipped++;
      continue;
    }
    try {
      const html = await fetchWithRetries(url);
      const props = extractPageProps(html);
      const recipe = props?.recipe;
      if (!recipe) throw new Error("no recipe in pageProps");
      // Stamp provenance onto the raw record (kept separate from original fields).
      writeFileSync(
        out,
        JSON.stringify({ ...recipe, _sourceUrl: url, _fetchedAt: new Date().toISOString() }, null, 2)
      );
      ok++;
      process.stdout.write(`  ✓ ${id} ${recipe.titulo}\n`);
    } catch (err) {
      failed.push({ id, url, error: err.message });
      console.error(`  ✗ ${id}: ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  // --- about ---
  let aboutOk = false;
  try {
    const html = await fetchWithRetries(ABOUT_URL);
    const props = extractPageProps(html);
    if (props?.about) {
      writeFileSync(
        join(RAW, "acerca.json"),
        JSON.stringify({ ...props.about, _sourceUrl: ABOUT_URL, _fetchedAt: new Date().toISOString() }, null, 2)
      );
      aboutOk = true;
    }
  } catch (err) {
    console.error(`  ✗ acerca: ${err.message}`);
  }

  // --- report ---
  const errorsPath = join(RAW, "errors.json");
  writeFileSync(errorsPath, JSON.stringify(failed, null, 2));

  const ids = recetaUrls.map((u) => Number(u.match(/\/receta\/(\d+)\//)[1]));
  const min = Math.min(...ids),
    max = Math.max(...ids);
  const present = new Set(ids);
  const gaps = [];
  for (let i = min; i <= max; i++) if (!present.has(i)) gaps.push(i);

  console.log("\n=== SUMMARY ===");
  console.log(`recipes fetched this run: ${ok} (skipped already-fetched: ${skipped})`);
  console.log(`failures: ${failed.length}`);
  console.log(`acerca: ${aboutOk ? "OK" : "FAILED"}`);
  console.log(`id range: ${min}..${max}, missing ids (${gaps.length}): ${gaps.join(", ") || "none"}`);
  if (failed.length > 0) {
    console.log(`re-run this script to retry failures (resumable). Errors: ${errorsPath}`);
    process.exit(1);
  }
}

main();
