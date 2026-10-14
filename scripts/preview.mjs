// Static preview of dist/. `astro preview` is unsupported by @astrojs/netlify,
// and the site is fully prerendered, so a plain file server is enough to check
// the build locally (including the Pagefind search at /buscar).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";

const root = resolve("dist");
const port = Number(process.env.PORT) || 4322;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".wasm": "application/wasm",
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

// Mirrors the host: /x -> x.html or x/index.html.
async function resolveFile(pathname) {
  const base = join(root, normalize(pathname));
  if (base !== root && !base.startsWith(root + sep)) return null;
  for (const candidate of [base, join(base, "index.html"), `${base}.html`]) {
    if (await isFile(candidate)) return candidate;
  }
  return null;
}

try {
  await stat(root);
} catch {
  console.error("dist/ not found — run `npm run build` first.");
  process.exit(1);
}

createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  const file = await resolveFile(pathname);
  const target = file ?? join(root, "404.html");
  const body = await readFile(target).catch(() => null);
  if (!body) {
    res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
    return;
  }
  res.writeHead(file ? 200 : 404, {
    "content-type": types[extname(target)] ?? "application/octet-stream",
  });
  res.end(req.method === "HEAD" ? undefined : body);
}).listen(port, () => console.log(`Preview de dist/ en http://localhost:${port}`));
