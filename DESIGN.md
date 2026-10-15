---
name: BonGusto
description: A glossy food monthly for Antonio Bonnet's recipe archive. Edge-to-edge photography, a condensed black masthead, and one hot ají-red color field.
colors:
  ink: "#16120F"
  paper: "#FFFFFF"
  aji: "#D43B1A"
  aji-deep: "#A82C10"
  amarillo: "#FFC72C"
  smoke: "#F1EEEA"
  muted: "#5B554F"
  rule: "#D9D4CE"
typography:
  masthead:
    fontFamily: "Archivo Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(4rem, 23.8vw, 20rem)"
    fontWeight: 900
    lineHeight: 0.74
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 7rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.025em"
  dek:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "clamp(1.25rem, 2vw, 1.75rem)"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "Source Serif 4 Variable, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
  kicker:
    fontFamily: "Archivo Variable, Arial Narrow, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    letterSpacing: "0.08em"
  scale:
    masthead-compact: "clamp(3rem, 8vw, 6.5rem)"
    footer-mark: "clamp(3.5rem, 20vw, 17rem)"
    cover-title: "clamp(2.75rem, 7.4vw, 6.5rem)"
    cover-dek: "1.25rem"
    banner-title: "clamp(4rem, 17vw, 15rem)"
    listing-title: "clamp(3rem, 9vw, 8rem)"
    about-title: "clamp(3.5rem, 10vw, 9rem)"
    about-dek: "1.5rem"
    title-404: "clamp(3.5rem, 13vw, 11rem)"
    section-title: "clamp(2.5rem, 6vw, 4.5rem)"
    subsection-title: "clamp(2rem, 3.4vw, 3rem)"
    end-title: "clamp(1.75rem, 3vw, 2.5rem)"
    pagination-step: "clamp(1.25rem, 3vw, 2.25rem)"
    story-title: "clamp(1.75rem, 2.4vw, 2.25rem)"
    story-title-large: "clamp(2.25rem, 4vw, 3.75rem)"
    story-title-band: "clamp(2.5rem, 4.4vw, 4.25rem)"
    result-title: "1.75rem"
    prose-head: "1.375rem"
    story-dek: "1.0625rem"
    story-dek-large: "1.1875rem"
    ingredient: "1.0625rem"
    ui-label: "0.8125rem"
    ui-category: "0.875rem"
    ui-label-large: "0.9375rem"
    ui-count: "1rem"
    about-courses: "1rem"
    badge: "0.6875rem"
rounded:
  none: "0"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
  xl: "64px"
components:
  kicker:
    textColor: "{colors.aji}"
    typography: "{typography.kicker}"
  cover-panel:
    backgroundColor: "{colors.aji}"
    textColor: "{colors.paper}"
    padding: "32px"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
---

# Design System: BonGusto

## Overview

**Creative North Star: "El número del mes"**

A glossy food monthly, not a blog with magazine fonts. The page is white gloss, the ink is near-black, and the only saturated field is Ají, a hot vermilion that owns whole regions: the cover panel, the department banner, the page-end band. Photography runs edge to edge. Headlines are tall condensed black type set tight; the history of each dish is long-form serif text with a drop cap. Squared corners, no cards, no shadows: layout comes from the grid, rules, and scale.

The reader is a cooking student or peer looking up a recipe, so the recipe is never decoration. Ingredients sit in a sticky left column and the method in the right one, side by side with the history.

**Key characteristics:**
- Committed color strategy: Ají red drenches the cover panel, department/search banners, the About opener, and the 404; the rest is white and ink.
- Condensed black headlines (Archivo, width axis) against a text serif (Source Serif 4) for dek and body.
- Edge-to-edge photography, always 4:3 source cropped to the frame with `object-fit: cover`.
- Editorial devices are all derived from real data: category as department kicker, `created_at` as dateline, Antonio Bonnet as the single byline.

## Colors

- **Ink** (`#16120F`): text, rules, the footer field.
- **Paper** (`#FFFFFF`): the page, glossy white. Not cream.
- **Ají** (`#D43B1A`): the signature. Kickers, the cover panel, department banners, active states. White text on Ají is ≥4.7:1.
- **Ají Deep** (`#A82C10`): hover and pressed.
- **Amarillo** (`#FFC72C`): a highlighter. Only on Ají or ink backgrounds (kicker on the cover panel, text selection, focus ring on dark). Never as text on white.
- **Smoke** (`#F1EEEA`) and **Rule** (`#D9D4CE`): the tinted ingredient panel, hairlines. **Muted** (`#5B554F`): secondary text, 7:1 on white.

**The One Field Rule.** Ají is a field, not an accent sprinkled over a neutral page. If it appears, it appears as a whole block or as a small kicker; never as a gradient, a border-left stripe, or a glow.

## Typography

- **Archivo Variable** with the width axis: masthead and headlines at width 62-75 (condensed), weight 800-900; kickers and UI labels at width 100, weight 800, uppercase, `0.08em` tracking.
- **Source Serif 4 Variable**: dek (description), history, ingredients, and method at 18px / 1.65, measure capped near 66ch. Italic is used for the dek (cover and recipe standfirst) only.
- Scale: masthead 4 -> 20rem, headline 2.75 -> 7rem, dek 1.25 -> 1.75rem, body 1.125rem, kicker 0.8125rem.
- In use (all fluid with `clamp` unless noted): story title 1.75 -> 2.25rem, large story 2.25 -> 3.75rem, band story 2.5 -> 4.25rem, section title 2.5 -> 4.5rem (recipe/about subsections 2 -> 3rem), banner title 4 -> 15rem, 404 title 3.5 -> 11rem, about title 3.5 -> 9rem, listing title 3 -> 8rem, cover title 2.75 -> 6.5rem, compact nameplate 3 -> 6.5rem, footer mark 3.5 -> 17rem, recipe end title 1.75 -> 2.5rem, pagination steps 1.25 -> 2.25rem, search result title 1.75rem, recipe dek 1.25 -> 1.75rem, cover dek 1.25rem, about dek 1.5rem, story dek 1.0625rem (large 1.1875rem), ingredient text 1.0625rem, prose heads 1.375rem, UI labels 0.8125-1rem, saved-count badge 0.6875rem.

**The Condensed Rule.** Any display text sits at tight leading (≤0.95) and negative tracking (≥ -0.03em). Body never does.

## Layout

12-column grid, 1360px max, 24px gutters (16px on mobile). Pages open with a full-bleed element: the cover on home, the department banner on categories, the photo on a recipe. The listing grid repeats rows of 7+5, 4+4+4, and one 12-col band; a partial last row is split evenly so no row ever has a hole. On mobile everything is one column.

## Elevation & Depth

None. Hierarchy comes from scale, color fields, and rules. The only "lift" is the photo zoom on hover (1.04, 0.6s, ease-out) and the view-transition morph of the recipe photo between list and page.

## Shapes

Zero radius everywhere. Rules are 1px Rule or 3px Ink for section tops.

## Components

- **Masthead:** utility strip (recipe count, Buscar, Acerca), the "BON|GUSTO" wordmark (Ají + ink), and a department bar of the 8 categories between 3px ink rules. Home gets the full-width nameplate and the tagline "Bonnet al gusto · recetas con un poco de historia"; inner pages get a compact nameplate so the photo stays in the first viewport. The bar scrolls horizontally on mobile. From 1280px each department carries its real recipe count as a muted suffix ("Entrada · 79").
- **Story card:** photo (4:3), department kicker, headline, 3-line serif dek. Variants by span: large (7), side (5, photo stretches to the row height), standard (4/6), band (12, photo left, text right on Smoke).
- **Department banner:** full-bleed Ají field with the section name at 17vw, used for categories and search; the About page uses the same field beside the author photo.
- **Cover panel:** Ají block beside the cover photo with "Receta del número", headline, dek, link.
- **Recipe page:** kicker, headline, dek, byline and dateline, an Ají kicker link ("Ir a los ingredientes ↓") that jumps to the panel, and the full-bleed photo; then a grid with sticky ingredients (Smoke) left, history with drop cap and method right; then "Sigue leyendo" (three neighbours in the same category) under a 3px ink rule.
- **Save and share row:** 2px ink squared buttons in condensed caps. "Guardar" is the one Ají-filled button and turns ink with a filled bookmark once saved. Compartir (only where the browser has a share sheet), WhatsApp, Facebook, X and Copiar enlace sit beside it. It appears under the byline and again after the method.
- **Pagination:** condensed "Anterior / Siguiente" under a 3px ink rule with the page run between them (`1 … n n+1 … total` as real links, the current page in Ají; the full count stays for screen readers).
- **Footer:** ink field, wordmark, departments, colophon.

## Do's and Don'ts

- Do keep ingredients and method as the easiest things to find on a recipe page.
- Do derive every editorial device from real fields. No invented issue numbers, ratings, times, or yields.
- Don't use cream, parchment, or italic display serifs. This is white gloss and condensed black sans.
- Don't wrap things in cards, round corners, or add shadows.
- Don't place Amarillo text on white.
