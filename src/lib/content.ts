/**
 * Content access layer — Keystatic Reader API + rendering helpers.
 * Drafts (`publico: false`) are excluded everywhere by default.
 */
import { createReader } from "@keystatic/core/reader";
import Markdoc from "@markdoc/markdoc";
import keystaticConfig from "../../keystatic.config";
import { slugify } from "./slugify.js";

export const reader = createReader(process.cwd(), keystaticConfig);

export type Receta = NonNullable<Awaited<ReturnType<typeof reader.collections.recetas.read>>>;
export type Categoria = NonNullable<Awaited<ReturnType<typeof reader.collections.categorias.read>>>;
export type Acerca = NonNullable<Awaited<ReturnType<typeof reader.singletons.acerca.read>>>;

// Memoized per build: getStaticPaths AND page frontmatter both call these
// helpers, and the Reader re-reads every YAML file on each `.read()` call.
let recetasCache: Promise<(Receta | null)[]> | undefined;
let categoriasCache: Promise<{ slug: string; categoria: Categoria }[]> | undefined;

function loadAllRecetas() {
  const load = async () => {
    const slugs = await reader.collections.recetas.list();
    return Promise.all(slugs.map((s) => reader.collections.recetas.read(s)));
  };
  // Dev: never cache — Keystatic admin edits write YAML to disk and must
  // show up on the next page load without a dev-server restart.
  if (import.meta.env.DEV) return load();
  recetasCache ??= load();
  return recetasCache;
}

export async function getAllRecetas(includeDrafts = false): Promise<Receta[]> {
  const entries = await loadAllRecetas();
  return entries.filter((r): r is Receta => !!r && (includeDrafts || r.publico === true));
}

/** Canonical URL — the id is what's authoritative; the slug is decorative. */
export function recetaUrl(receta: Receta): string {
  return `/receta/${receta.id}/${slugify(receta.titulo)}`;
}

/**
 * Listing image for a recipe card. Thumbs are stored as 100px Cloudinary
 * crops (w_100,h_100,c_thumb); request the same transformation at card
 * resolution instead of shipping a blurry upscale or the full photo.
 * Falls back to the full photo when there is no Cloudinary thumb.
 */
export function recetaCardImage(receta: Pick<Receta, "photo">): string | undefined {
  const thumb = receta.photo?.thumb;
  if (thumb?.includes("/image/upload/") && thumb.includes("w_100,h_100,c_thumb")) {
    return thumb.replace("w_100,h_100,c_thumb", "w_600,h_600,c_thumb");
  }
  return receta.photo?.url ?? undefined;
}

export async function getRecetaById(id: number): Promise<Receta | undefined> {
  const all = await getAllRecetas(true);
  return all.find((r) => r.id === id);
}

export async function getCategorias(): Promise<{ slug: string; categoria: Categoria }[]> {
  const load = async () => {
    const slugs = await reader.collections.categorias.list();
    const entries = await Promise.all(slugs.map((s) => reader.collections.categorias.read(s)));
    return slugs.map((slug, i) => ({ slug, categoria: entries[i] as Categoria }));
  };
  if (import.meta.env.DEV) return load();
  categoriasCache ??= load();
  return categoriasCache;
}

/** Public recipes in a category, newest (highest id) first. */
export async function getRecetasByCategoria(slug: string): Promise<Receta[]> {
  const all = await getAllRecetas();
  return all
    .filter((r) => (r.categorias ?? []).includes(slug))
    .sort((a, b) => b.id - a.id);
}

export async function getAcerca(): Promise<Acerca | undefined> {
  return reader.singletons.acerca.read();
}

/** Render a markdoc field (Reader returns { node }; tolerate plain strings).
 *  Strips the `<article>` wrapper Markdoc.renderers.html adds for documents. */
export function renderMarkdoc(value: unknown): string {
  if (!value) return "";
  const node =
    typeof value === "string"
      ? Markdoc.parse(value)
      : (value as { node?: unknown }).node ?? null;
  if (!node) return "";
  const html: string = Markdoc.renderers.html(Markdoc.transform(node as never));
  if (html.startsWith("<article>") && html.endsWith("</article>") && !html.includes("<article>", 9)) {
    return html.slice(9, -10);
  }
  return html;
}
