/**
 * Redirect audit — pre-cutover safety gate.
 *
 * Walks every URL of the OLD site (data/raw/sitemap-urls.txt) plus every
 * source path declared in public/_redirects, and asserts each one resolves
 * to a 2xx page on the target deploy (directly or via a redirect chain).
 *
 * Run against the Netlify preview BEFORE pointing DNS at it:
 *
 *   node scripts/check-redirects.mjs https://<preview-subdomain>.netlify.app
 *
 * Default target is the production domain (post-cutover re-checks).
 * Exits 1 if any old URL would 404 — every miss needs a _redirects entry
 * or a content fix before the DNS flip.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || process.env.AUDIT_BASE || "https://bongusto.net").replace(/\/+$/, "");
const MAX_HOPS = 5;
const THROTTLE_MS = 150;
const RETRIES = 3;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Old-site URLs (absolute, mixed http/https, no www) → paths. */
function pathsFromSitemap() {
  const file = path.join(root, "data/raw/sitemap-urls.txt");
  return readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      try {
        return new URL(line).pathname;
      } catch {
        return line;
      }
    });
}

/** Source paths (first column) declared in public/_redirects. */
function pathsFromRedirects() {
  const file = path.join(root, "public/_redirects");
  return readFileSync(file, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/)[0]);
}

/** GET with retries on network errors and transient server responses. */
async function fetchWithRetry(url) {
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, { redirect: "manual" });
      if (![429, 500, 502, 503].includes(res.status) || attempt === RETRIES) return res;
    } catch (err) {
      if (attempt === RETRIES) throw err;
    }
    await sleep(500 * attempt);
  }
}

/** Fetch following redirects manually so the chain is visible per URL. */
async function trace(pathname) {
  let url = BASE + pathname;
  const chain = [];
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    const res = await fetchWithRetry(url);
    chain.push(res.status);
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const location = new URL(res.headers.get("location") ?? "", url);
      url = location.origin + location.pathname + location.search;
      continue;
    }
    return { ok: res.status >= 200 && res.status < 300, chain };
  }
  return { ok: false, chain: [...chain, "too-many-hops"] };
}

const paths = [...new Set([...pathsFromSitemap(), ...pathsFromRedirects()])];
console.log(`Auditing ${paths.length} URLs against ${BASE}\n`);

const failures = [];
for (let i = 0; i < paths.length; i++) {
  const pathname = paths[i];
  try {
    const { ok, chain } = await trace(pathname);
    if (!ok) failures.push({ pathname, chain });
  } catch (err) {
    failures.push({ pathname, chain: [String(err?.cause?.code ?? err.message)] });
  }
  if ((i + 1) % 50 === 0) console.log(`  …${i + 1}/${paths.length} checked`);
  await sleep(THROTTLE_MS);
}

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} URL(s) do NOT resolve on ${BASE}:`);
  for (const { pathname, chain } of failures) {
    console.error(`  ${pathname}  →  [${chain.join(" → ")}]`);
  }
  console.error("\nAdd _redirects entries or fix content, then re-run before cutover.");
  process.exit(1);
}
console.log(`\n✓ All ${paths.length} URLs resolve on ${BASE}. Safe to cut over.`);
