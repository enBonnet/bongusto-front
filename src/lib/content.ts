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

export async function getAllRecetas(includeDrafts = false): Promise<Receta[]> {
  const slugs = await reader.collections.recetas.list();
  const entries = await Promise.all(slugs.map((s) => reader.collections.recetas.read(s)));
  return entries.filter((r): r is Receta => !!r && (includeDrafts || r.publico === true));
}

/** Canonical URL — the id is what's authoritative; the slug is decorative. */
export function recetaUrl(receta: Receta): string {
  return `/receta/${receta.id}/${slugify(receta.titulo)}`;
}

export async function getRecetaById(id: number): Promise<Receta | undefined> {
  const all = await getAllRecetas(true);
  return all.find((r) => r.id === id);
}

export async function getCategorias(): Promise<{ slug: string; categoria: Categoria }[]> {
  const slugs = await reader.collections.categorias.list();
  const entries = await Promise.all(slugs.map((s) => reader.collections.categorias.read(s)));
  return slugs.map((slug, i) => ({ slug, categoria: entries[i] as Categoria }));
}

export async function getAcerca(): Promise<Acerca | undefined> {
  return reader.singletons.acerca.read();
}

/** Render a markdoc field (Reader returns { node }; tolerate plain strings). */
export function renderMarkdoc(value: unknown): string {
  if (!value) return "";
  const node =
    typeof value === "string"
      ? Markdoc.parse(value)
      : (value as { node?: unknown }).node ?? null;
  if (!node) return "";
  return Markdoc.renderers.html(Markdoc.transform(node as never));
}
