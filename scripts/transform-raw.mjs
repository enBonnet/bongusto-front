#!/usr/bin/env node
/**
 * Loop 3 — Transform raw rescued JSON into Keystatic entry format.
 * data/raw/recetas/*.json  → content/recetas/{id}-{slug}.yaml
 * derived categorias        → content/categorias/{slug}.yaml
 * data/raw/acerca.json      → content/acerca/acerca.yaml
 */
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse, stringify } from "yaml";
import { slugify } from "../src/lib/slugify.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const CONTENT = join(ROOT, "content");

mkdirSync(join(CONTENT, "recetas"), { recursive: true });
mkdirSync(join(CONTENT, "categorias"), { recursive: true });
mkdirSync(join(CONTENT, "acerca"), { recursive: true });

const files = readdirSync(join(RAW, "recetas")).filter((f) => f.endsWith(".json"));
console.log(`transforming ${files.length} raw recipes…`);

// ---------- pass 1: derive categories ----------
const catSlugToName = new Map();
const recipes = [];
for (const file of files) {
  const raw = JSON.parse(readFileSync(join(RAW, "recetas", file), "utf8"));
  recipes.push(raw);
  for (const cat of raw.categorias ?? []) {
    const slug = slugify(cat.nombre);
    if (!slug) throw new Error(`empty category slug from "${cat.nombre}" (recipe ${raw.id})`);
    if (catSlugToName.has(slug) && catSlugToName.get(slug) !== cat.nombre) {
      throw new Error(`category slug collision: "${slug}" maps to both "${catSlugToName.get(slug)}" and "${cat.nombre}"`);
    }
    catSlugToName.set(slug, cat.nombre);
  }
}
for (const [slug, nombre] of catSlugToName) {
  writeFileSync(join(CONTENT, "categorias", `${slug}.yaml`), stringify({ nombre }, { lineWidth: 0 }));
}
console.log(`categorias: ${catSlugToName.size} → ${[...catSlugToName.keys()].join(", ")}`);

// ---------- pass 2: recipes ----------
let written = 0;
const fieldStats = { historia: 0, ingredientes: 0, preparacion: 0, photo: 0, descripcion: 0 };
const filenameSlugs = new Map(); // entry slug → id (collision check)
for (const raw of recipes) {
  const entrySlug = `${raw.id}-${slugify(raw.titulo)}`;
  if (filenameSlugs.has(entrySlug)) throw new Error(`entry slug collision: ${entrySlug}`);
  filenameSlugs.set(entrySlug, raw.id);

  const cats = [...new Set((raw.categorias ?? []).map((c) => slugify(c.nombre)))];
  // Keystatic fields.datetime expects "YYYY-MM-DDTHH:mm" (minutes precision).
  const dt = (v) => (typeof v === "string" ? v.slice(0, 16) : v);
  const data = {
    titulo: raw.titulo,
    id: raw.id,
    descripcion: raw.descripcion ?? "",
    publico: raw.publico === true,
    categorias: cats,
    photo: raw.photo?.url
      ? { url: raw.photo.url, alt: raw.titulo, ...(raw.imageBase ? { thumb: raw.imageBase } : {}) }
      : { url: null, alt: "" },
    created_at: dt(raw.created_at),
    updated_at: dt(raw.updated_at),
  };
  for (const key of ["historia", "ingredientes", "preparacion"]) {
    const val = (raw[key] ?? "").trim();
    if (val) {
      data[key] = val;
      fieldStats[key]++;
    }
  }
  if (data.photo.url) fieldStats.photo++;
  if (data.descripcion) fieldStats.descripcion++;

  writeFileSync(join(CONTENT, "recetas", `${entrySlug}.yaml`), stringify(data, { lineWidth: 0 }));
  written++;
}

// ---------- pass 3: acerca ----------
const about = JSON.parse(readFileSync(join(RAW, "acerca.json"), "utf8"));
const acerca = {
  biografia: (about.biografia ?? "").trim(),
  cursos: (about.cursos ?? "").trim(),
  photo: { url: about.photo?.url ?? null, alt: "Antonio Bonnet" },
};
writeFileSync(
  join(CONTENT, "acerca", "acerca.yaml"),
  stringify(acerca, { lineWidth: 0 })
);

// ---------- report ----------
console.log(`\n=== TRANSFORM SUMMARY ===`);
console.log(`recetas written: ${written}`);
console.log(`fields present: `, fieldStats);
console.log(`categorias: ${catSlugToName.size}`);
console.log(`acerca: OK`);
const noCat = recipes.filter((r) => !(r.categorias ?? []).length).length;
if (noCat) console.log(`⚠ ${noCat} recipes without categories`);
console.log(
  `⚠ WARNING: this overwrites content/ in place. Once the CMS is in use, ` +
    `editor changes live in content/ and re-running this script will clobber them.`
);
