/**
 * Loop 3 gate — empirically verify the Keystatic Reader API loads all content.
 * Run: npx tsx scripts/verify-reader.mts
 */
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import Markdoc from "@markdoc/markdoc";

import { readdirSync } from "node:fs";

const reader = createReader(process.cwd(), keystaticConfig);

// expected count = number of raw rescued files (source of truth), not hardcoded
const expected = readdirSync(new URL("../data/raw/recetas/", import.meta.url)).filter((f) =>
  f.endsWith(".json")
).length;

// 1. list recetas
const slugs = await reader.collections.recetas.list();
console.log(`recetas listed: ${slugs.length} (expected ${expected})`);
if (slugs.length !== expected) throw new Error(`expected ${expected}, got ${slugs.length}`);

// 2. read one full entry
const entry = await reader.collections.recetas.read("1-ratatouille");
if (!entry) throw new Error("could not read 1-ratatouille");
console.log("titulo:", entry.titulo);
console.log("id:", entry.id, "| publico:", entry.publico, "| created_at:", entry.created_at);
console.log("categorias:", entry.categorias);
console.log("photo.url:", entry.photo?.url);
console.log("historia type:", typeof entry.historia, "| is object:", typeof entry.historia === "object");

// 3. what are the inline markdoc fields? try rendering
for (const key of ["historia", "ingredientes", "preparacion"]) {
  const v = entry[key] as any;
  if (typeof v === "string") {
    console.log(`${key}: string (len ${v.length})`);
  } else if (v && typeof v === "object") {
    const keys = Object.keys(v);
    console.log(`${key}: object keys=${keys.join(",")}`);
    if ("node" in v) {
      const renderable = Markdoc.transform(v.node);
      const html = Markdoc.renderers.html(renderable);
      console.log(`${key}: markdoc node → html len ${html.length}, sample: ${html.slice(0, 80).replace(/\n/g, " ")}`);
    }
  } else {
    console.log(`${key}: ${v}`);
  }
}

// 4. categorias
const catSlugs = await reader.collections.categorias.list();
console.log(`categorias listed: ${catSlugs.length} → ${catSlugs.join(", ")}`);

// 5. acerca singleton
const acerca = await reader.singletons.acerca.read();
console.log("acerca biografia type:", typeof acerca?.biografia, "| photo:", acerca?.photo?.url?.slice(0, 50));

// 6. sweep: read ALL entries, validate required bits
let bad = 0;
for (const slug of slugs) {
  const r = await reader.collections.recetas.read(slug);
  if (!r || typeof r.id !== "number" || !r.titulo || typeof r.publico !== "boolean") {
    console.error("BAD entry:", slug);
    bad++;
  }
}
console.log(`full sweep: ${slugs.length - bad}/${slugs.length} entries valid`);
if (bad > 0) throw new Error(`${bad} invalid entries`);
console.log("LOOP 3 GATE: PASS");
