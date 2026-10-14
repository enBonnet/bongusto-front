# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Antonio Bonnet's cooking students and professional peers (confirmed by the owner). They use the site as a reference: they look up a recipe, read the technique and the correct culinary terms (brunoise, concassé, vichy, juliana), and cross-check history and method. Home cooks also arrive, but they are not the primary audience. Spanish-speaking, mostly Venezuelan and Latin American.

## Product Purpose
BonGusto ("Bonnet al gusto") publishes Latin American and international recipes, each with a short history, by Antonio Bonnet, a professional cook and chef instructor (Universidad Central de Venezuela, Universidad de Carabobo). The goal is a trustworthy, browsable teaching archive of his recipes. Success means a reader finds a recipe fast and can follow ingredients and method without ambiguity.

## Positioning
A single instructor's personal recipe archive: every recipe is paired with its history, and the whole collection reflects one chef-teacher's classroom (French, Latin American, Mediterranean, international cuisines, pastry, wine pairing).

## Operating Context
Static Astro site on Netlify. Content lives in YAML in `content/` and is edited through Keystatic. Search is Pagefind (generated at build, not available under `astro dev`). Recipe photos come from Cloudinary. View transitions animate the recipe photo between list and recipe page.

## Capabilities and Constraints
- 306 public recipes, newest-first by id, 15 per page (`/pagina/N`), all with a photo.
- 8 categories: Entrada, Principal, Salsa, Postre, Guarnición, Maridaje, Condimento, Pasa-palo.
- Recipe fields: titulo, descripcion, categorias, photo (url, alt, thumb), historia, ingredientes, preparacion (Markdoc), created_at, updated_at.
- Pages: home/list, recipe, category (paginated), search, Acerca de mí, 404.
- URLs are fixed (`/receta/{id}/{slug}`, `/pagina/N`, `/categoria/{slug}`); SEO (JSON-LD Recipe, sitemap) and Pagefind markers (`data-pagefind-body`, `data-pagefind-meta`) must be preserved.
- UI language is Spanish.
- Content is not authored for a magazine: there are no authored issue numbers, bylines per recipe, or editorial standfirsts. Anything of that kind must be derived from real fields or left out.

## Brand Commitments
Name "BonGusto" (tagline "Bonnet al gusto"). The logo file is `public/bongusto-rounded.png`. Current palette is green accent on grey; the owner asked for a redesign, so the palette is not binding. The owner explicitly asked for a magazine look: a glossy food monthly.

## Evidence on Hand
Real photographs for every recipe (Cloudinary), recipe histories, the author's biography and course list in `content/acerca/acerca.yaml`, and an author photo. There are no testimonials, press mentions, or reader counts, and none should be invented.

## Product Principles
1. The recipe stays the product: ingredients and method must remain easy to scan and follow, whatever the styling.
2. Photography leads; text earns its place beside it.
3. The history of each dish is the signature, so it gets real reading space instead of a footnote.
4. Use professional culinary vocabulary exactly as the author writes it; do not simplify or rewrite content.
5. Nothing fabricated: editorial devices come from real data (category, id, dates, photos).

## Accessibility & Inclusion
No product-specific requirement was stated. Meet WCAG AA contrast and keep focus states and reduced-motion handling (the site already honors `prefers-reduced-motion` for view transitions).
