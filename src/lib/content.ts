/**
 * Content access layer — Keystatic Reader API + rendering helpers.
 * Drafts (`publico: false`) are excluded everywhere by default.
 */
import { createReader } from "@keystatic/core/reader";
import Markdoc from "@markdoc/markdoc";
import keystaticConfig from "../../keystatic.config";
import { slugify } from "./slugify";

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

// f_auto/q_auto: Cloudinary picks AVIF/WebP per browser and a perceptual
// quality. Without them the uploads (mostly PNG) are served as-is, ~15x bigger.
const CLOUDINARY_DELIVERY = "f_auto,q_auto";

/**
 * Listing image for a recipe card. Cloudinary photos reuse the exact hero URL
 * (see recetaHeroImage): same bytes, so opening a recipe is served from the
 * browser cache instead of downloading the photo a second time, and the
 * list→detail view transition morphs identical pixels. The card box is 1:1 and
 * crops the 4:3 image with object-fit: cover.
 * Otherwise falls back to the stored 100px Cloudinary thumb upscaled to card
 * resolution, then to the full photo.
 */
export function recetaCardImage(receta: Pick<Receta, "photo">): string | undefined {
  const hero = recetaHeroImage(receta);
  if (hero && hero !== receta.photo?.url) return hero;
  const thumb = receta.photo?.thumb;
  if (thumb?.includes("/image/upload/") && thumb.includes("w_100,h_100,c_thumb")) {
    return thumb.replace("w_100,h_100,c_thumb", `${CLOUDINARY_DELIVERY},w_600,h_600,c_thumb`);
  }
  return receta.photo?.url ?? undefined;
}

/**
 * On-page hero image: request the original as a 600×450 c_fill crop so the
 * browser gets exactly the rendered box size (4/3) instead of stretching a
 * smaller original. Non-Cloudinary URLs pass through untouched; og:image
 * keeps the original full-size URL.
 */
export function recetaHeroImage(receta: Pick<Receta, "photo">): string | undefined {
  const url = receta.photo?.url;
  if (!url) return undefined;
  const m = url.match(/^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/);
  return m ? `${m[1]}${CLOUDINARY_DELIVERY},w_600,h_450,c_fill/${m[2]}` : url;
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
  const root = transformedRoot(value);
  if (!root) return "";
  const html: string = Markdoc.renderers.html(root as never);
  if (html.startsWith("<article>") && html.endsWith("</article>") && !html.includes("<article>", 9)) {
    return html.slice(9, -10);
  }
  return html;
}

// --- JSON-LD (schema.org/Recipe) helpers -------------------------------------
//
// Structured data is built strictly from data the content model already has.
// prepTime/cookTime/recipeYield are deliberately omitted: the YAML has no
// such fields and inventing them would fabricate facts.

// Markdoc.transform() output: Tag nodes (`name` + children), with plain
// strings for text — NOT the parse-time AST node types.
type MdTag = { name?: string; children?: (MdTag | string)[] };

function transformedRoot(value: unknown): MdTag | null {
  if (!value) return null;
  const node =
    typeof value === "string"
      ? Markdoc.parse(value)
      : (value as { node?: unknown }).node ?? null;
  if (!node) return null;
  return Markdoc.transform(node as never) as unknown as MdTag;
}

const isList = (tag: MdTag | string): tag is MdTag =>
  typeof tag !== "string" && (tag.name === "ul" || tag.name === "ol");

function tagText(tag: MdTag | string): string {
  if (typeof tag === "string") return tag;
  // join(" ") so adjacent inline nodes (e.g. "**200g**de harina") can't fuse
  // into one word; collapse runs afterwards because nodes that already carry
  // their own spaces ("**200 g** de harina") would come out double-spaced.
  return (tag.children ?? []).map(tagText).join(" ").replace(/\s+/g, " ");
}

/** Text lines of one block: a list explodes into one line per item
 *  (nested lists and paragraphs inside items become their own lines),
 *  anything else is its text. */
function blockLines(tag: MdTag | string): string[] {
  if (isList(tag)) return (tag.children ?? []).flatMap(blockLines);
  if (typeof tag !== "string" && tag.name === "li") {
    const lines: string[] = [];
    const inline: (MdTag | string)[] = [];
    const flush = () => {
      const text = inline
        .map((k) => tagText(k))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) lines.push(text);
      inline.length = 0;
    };
    for (const kid of tag.children ?? []) {
      if (typeof kid !== "string" && ["p", "ul", "ol"].includes(kid.name ?? "")) {
        flush();
        if (kid.name === "p") {
          const text = tagText(kid).trim();
          if (text) lines.push(text);
        } else {
          lines.push(...blockLines(kid));
        }
      } else {
        inline.push(kid);
      }
    }
    flush();
    return lines;
  }
  const text = tagText(tag).trim();
  return text ? [text] : [];
}

/**
 * Plain-text lines of a markdoc field, in document order: list items
 * individually, headings and paragraphs as their text. Ingredientes fields
 * mix all three (section headings + bullet lists), so every block type is
 * kept — dropping headings would reorder or lose grouping context.
 */
export function markdocLines(value: unknown): string[] {
  const root = transformedRoot(value);
  if (!root) return [];
  return (root.children ?? []).flatMap(blockLines);
}

export interface MarkdocSection {
  /** Heading text, when the group was introduced by one. */
  name?: string;
  lines: string[];
}

/**
 * Same walk as markdocLines, but blocks are grouped under their preceding
 * heading. Preparación fields use headings as phase titles ("Para La Salsa:"),
 * which schema.org wants as HowToSection — not as fake steps.
 */
export function markdocSections(value: unknown): MarkdocSection[] {
  const root = transformedRoot(value);
  if (!root) return [];
  const sections: MarkdocSection[] = [];
  for (const block of root.children ?? []) {
    const isHeading = typeof block !== "string" && /^h[1-6]$/.test(block.name ?? "");
    if (isHeading) {
      sections.push({ name: tagText(block).trim() || undefined, lines: [] });
    } else {
      const lines = blockLines(block);
      if (lines.length === 0) continue;
      const last = sections.at(-1);
      if (last) {
        last.lines.push(...lines);
      } else {
        sections.push({ lines });
      }
    }
  }
  // A HowToSection needs steps; drop named-but-empty leftovers.
  return sections.filter((s) => s.lines.length > 0);
}

/** ISO 8601 date string, or undefined when missing/unparseable.
 *  Content datetimes are naive (no offset). Parsing them as local time made
 *  builds machine-dependent (CI UTC vs dev UTC+3 emitted different dates), so
 *  naive values are normalized to UTC — wall-clock time is preserved in the
 *  output string; only the (unknown, unrecorded) offset is pinned. */
function isoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:?\d{2})$/.test(value)
      ? value
      : `${value}Z`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export interface RecipeJsonLdInput {
  receta: Receta;
  /** Canonical URL of the recipe page. */
  url: string;
  /** Visible category names (chips), already filtered for dangling refs. */
  categorias: string[];
  /** Site author (About page identity). */
  author: string;
}

/** schema.org instruction list: named sections become HowToSection, leading
 *  section-less content stays flat HowToStep — both may mix in one array. */
function instructionsFromSections(sections: MarkdocSection[]): Record<string, unknown>[] {
  return sections.flatMap((section) =>
    section.name
      ? [
          {
            "@type": "HowToSection",
            name: section.name,
            itemListElement: section.lines.map((text) => ({ "@type": "HowToStep", text })),
          },
        ]
      : section.lines.map((text) => ({ "@type": "HowToStep", text })),
  );
}

/** schema.org/Recipe for a recipe page. Fields without data are omitted
 *  rather than defaulted, so the markup never claims what it can't show. */
export function buildRecipeJsonLd({
  receta,
  url,
  categorias,
  author,
}: RecipeJsonLdInput): Record<string, unknown> {
  const ingredients = markdocLines(receta.ingredientes);
  const instructions = instructionsFromSections(markdocSections(receta.preparacion));
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: receta.titulo.trim(),
    // Recipe rich results require an image; photo-less recipes simply won't
    // be eligible, which beats inventing a placeholder image.
    ...(receta.photo?.url ? { image: [receta.photo.url] } : {}),
    ...(receta.descripcion?.trim() ? { description: receta.descripcion.trim() } : {}),
    ...(isoDate(receta.created_at) ? { datePublished: isoDate(receta.created_at) } : {}),
    ...(isoDate(receta.updated_at) ? { dateModified: isoDate(receta.updated_at) } : {}),
    author: { "@type": "Person", name: author },
    inLanguage: "es",
    url,
    ...(categorias.length
      ? {
          // Google's docs type recipeCategory as a single Text; the primary
          // (first) category represents the dish, all of them go in keywords.
          recipeCategory: categorias[0],
          keywords: categorias.join(", "),
        }
      : {}),
    ...(ingredients.length ? { recipeIngredient: ingredients } : {}),
    ...(instructions.length ? { recipeInstructions: instructions } : {}),
  };
  return schema;
}
