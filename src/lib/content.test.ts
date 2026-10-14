import { describe, expect, it } from "vitest";
import Markdoc from "@markdoc/markdoc";
import { buildRecipeJsonLd, markdocLines, markdocSections, recetaCardImage, recetaHeroImage, renderMarkdoc } from "./content";

describe("renderMarkdoc", () => {
  it("returns empty string for falsy input", () => {
    expect(renderMarkdoc(null)).toBe("");
    expect(renderMarkdoc(undefined)).toBe("");
    expect(renderMarkdoc("")).toBe("");
  });

  it("renders a plain string and strips the <article> wrapper", () => {
    const html = renderMarkdoc("hola **mundo**");
    expect(html).toContain("<strong>mundo</strong>");
    expect(html).not.toContain("<article>");
  });

  it("renders a Reader { node } value (inline markdoc fields)", () => {
    const value = { node: Markdoc.parse("- azúcar\n- harina") };
    const html = renderMarkdoc(value);
    expect(html).toContain("<li>azúcar</li>");
    expect(html).toContain("<li>harina</li>");
    expect(html).not.toContain("<article>");
  });

  it("renders all blocks of a multi-block document", () => {
    const html = renderMarkdoc("uno\n\ndos");
    expect(html).toContain("<p>uno</p>");
    expect(html).toContain("<p>dos</p>");
  });

  it("escapes raw HTML — no <article> (or any tag) passes through", () => {
    // This is why the never-strip branch in renderMarkdoc is unreachable
    // from content: Markdoc escapes raw HTML, so a nested article can only
    // come from a future renderer change — which this pins.
    const html = renderMarkdoc("<article>hola</article>");
    expect(html).not.toContain("<article>");
    expect(html).toContain("hola");
  });
});

describe("recetaCardImage", () => {
  const cloudinaryBase = "https://res.cloudinary.com/enbonnet/image/upload";

  it("reuses the hero URL so the recipe page hits the browser cache", () => {
    const photo = {
      url: `${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`,
      thumb: `${cloudinaryBase}/w_100,h_100,c_thumb/nzzlltblm8rfco38t1ao`,
      alt: "x",
    };
    expect(recetaCardImage({ photo })).toBe(recetaHeroImage({ photo }));
  });

  it("upscales the stored thumb when the full photo is not a Cloudinary URL", () => {
    const src = recetaCardImage({
      photo: {
        url: "https://example.com/a.jpg",
        thumb: `${cloudinaryBase}/w_100,h_100,c_thumb/nzzlltblm8rfco38t1ao`,
        alt: "x",
      },
    });
    expect(src).toBe(`${cloudinaryBase}/f_auto,q_auto,w_600,h_600,c_thumb/nzzlltblm8rfco38t1ao`);
  });

  it("falls back to the full photo when there is no thumb", () => {
    const src = recetaCardImage({
      photo: { url: "https://example.com/a.jpg", thumb: null, alt: "" },
    });
    expect(src).toBe("https://example.com/a.jpg");
  });

  it("does not rewrite non-Cloudinary thumbs that happen to contain the transformation", () => {
    const src = recetaCardImage({
      photo: {
        url: "https://example.com/real.jpg",
        thumb: "https://example.com/w_100,h_100,c_thumb/small.jpg",
        alt: "",
      },
    });
    expect(src).toBe("https://example.com/real.jpg");
  });

  it("ignores Cloudinary thumbs with a different transformation and uses the sized hero", () => {
    const src = recetaCardImage({
      photo: {
        url: `${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`,
        thumb: `${cloudinaryBase}/w_200,h_200,c_thumb/nzzlltblm8rfco38t1ao`,
        alt: "",
      },
    });
    expect(src).toBe(`${cloudinaryBase}/f_auto,q_auto,w_600,h_450,c_fill/v1573170326/nzzlltblm8rfco38t1ao.jpg`);
  });

  it("returns undefined when there is no photo at all", () => {
    expect(recetaCardImage({ photo: null })).toBeUndefined();
  });
});

describe("recetaHeroImage", () => {
  const cloudinaryBase = "https://res.cloudinary.com/enbonnet/image/upload";

  it("requests the hero at the rendered 600×450 box size", () => {
    const src = recetaHeroImage({
      photo: {
        url: `${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`,
        thumb: null,
        alt: "",
      },
    });
    expect(src).toBe(`${cloudinaryBase}/f_auto,q_auto,w_600,h_450,c_fill/v1573170326/nzzlltblm8rfco38t1ao.jpg`);
  });

  it("passes non-Cloudinary hero URLs through untouched", () => {
    const src = recetaHeroImage({
      photo: { url: "https://example.com/a.jpg", thumb: null, alt: "" },
    });
    expect(src).toBe("https://example.com/a.jpg");
  });

  it("returns undefined when there is no photo at all", () => {
    expect(recetaHeroImage({ photo: null })).toBeUndefined();
  });
});

describe("markdocLines", () => {
  it("returns an empty array for falsy input", () => {
    expect(markdocLines(null)).toEqual([]);
    expect(markdocLines(undefined)).toEqual([]);
    expect(markdocLines("")).toEqual([]);
  });

  it("extracts list items individually", () => {
    const value = { node: Markdoc.parse("- 5 tomates\n- 3 zanahorias") };
    expect(markdocLines(value)).toEqual(["5 tomates", "3 zanahorias"]);
  });

  it("includes headings and paragraphs in document order (real ingredientes mix all three)", () => {
    const value = {
      node: Markdoc.parse("4 Porciones\n### Para La Salsa:\n- 5 tomates\n\nReposar 1 hora."),
    };
    expect(markdocLines(value)).toEqual([
      "4 Porciones",
      "Para La Salsa:",
      "5 tomates",
      "Reposar 1 hora.",
    ]);
  });

  it("strips inline formatting to plain text", () => {
    const value = { node: Markdoc.parse("- **200 g** de *harina*") };
    expect(markdocLines(value)).toEqual(["200 g de harina"]);
  });

  it("skips empty list items and blank blocks", () => {
    const value = { node: Markdoc.parse("- \n- algo\n") };
    expect(markdocLines(value)).toEqual(["algo"]);
  });

  it("keeps inline nodes from fusing into words (join separator)", () => {
    const value = { node: Markdoc.parse("- **200g**de harina") };
    expect(markdocLines(value)).toEqual(["200g de harina"]);
  });

  it("explodes nested lists into their own lines instead of gluing them", () => {
    const value = { node: Markdoc.parse("- masa\n  - harina\n  - agua") };
    expect(markdocLines(value)).toEqual(["masa", "harina", "agua"]);
  });

  it("splits loose list items whose content wraps a paragraph", () => {
    const value = { node: Markdoc.parse("- item A\n\n  parrafo pegado") };
    expect(markdocLines(value)).toEqual(["item A", "parrafo pegado"]);
  });
});

describe("markdocSections", () => {
  const node = (md: string) => ({ node: Markdoc.parse(md) });

  it("returns one unnamed section when there are no headings", () => {
    expect(markdocSections(node("Paso uno.\n\nPaso dos."))).toEqual([
      { lines: ["Paso uno.", "Paso dos."] },
    ]);
  });

  it("groups blocks under their preceding heading", () => {
    expect(markdocSections(node("Intro.\n### Salsa:\n- Sofreír\n### Montaje:\n- Capas"))).toEqual([
      { lines: ["Intro."] },
      { name: "Salsa:", lines: ["Sofreír"] },
      { name: "Montaje:", lines: ["Capas"] },
    ]);
  });

  it("drops named-but-empty sections (heading with no following content)", () => {
    expect(markdocSections(node("### Solitario:\n"))).toEqual([]);
  });
});

describe("buildRecipeJsonLd", () => {
  const node = (md: string) => ({ node: Markdoc.parse(md) });
  // Date-only values parse as UTC midnight, so assertions are TZ-independent
  // (unlike "2019-11-06T23:03", which shifts across timezones).
  const base = {
    titulo: "Ratatouille",
    id: 1,
    descripcion: "Guisado de hortalizas.",
    publico: true,
    categorias: ["entrada"],
    photo: { url: "https://res.cloudinary.com/enbonnet/image/upload/v1/ratatouille.jpg", thumb: null, alt: "Ratatouille" },
    created_at: "2019-11-06",
    updated_at: "2019-11-09",
    historia: node("Historia corta."),
    ingredientes: node("- 5 tomates\n- 3 zanahorias"),
    preparacion: node("Cortar todo.\n\nGuisar a fuego lento."),
  };

  it("builds a complete Recipe schema from existing data", () => {
    const ld = buildRecipeJsonLd({
      receta: base as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: ["Entrada"],
      author: "Antonio Bonnet",
    });
    expect(ld["@type"]).toBe("Recipe");
    expect(ld.name).toBe("Ratatouille");
    expect(ld.image).toEqual(["https://res.cloudinary.com/enbonnet/image/upload/v1/ratatouille.jpg"]);
    expect(ld.description).toBe("Guisado de hortalizas.");
    expect(ld.datePublished).toBe("2019-11-06T00:00:00.000Z");
    expect(ld.dateModified).toBe("2019-11-09T00:00:00.000Z");
    expect(ld.author).toEqual({ "@type": "Person", name: "Antonio Bonnet" });
    expect(ld.inLanguage).toBe("es");
    expect(ld.url).toBe("https://www.bongusto.net/receta/1/ratatouille");
    expect(ld.recipeCategory).toBe("Entrada");
    expect(ld.keywords).toBe("Entrada");
    expect(ld.recipeIngredient).toEqual(["5 tomates", "3 zanahorias"]);
    expect(ld.recipeInstructions).toEqual([
      { "@type": "HowToStep", text: "Cortar todo." },
      { "@type": "HowToStep", text: "Guisar a fuego lento." },
    ]);
  });

  it("is timezone-independent for naive datetimes (no machine-dependent builds)", () => {
    // Recorded as wall-clock "23:03"; parsing as local time made CI (UTC) and
    // dev machines (UTC+3 etc.) emit different dates for the same commit.
    const ld = buildRecipeJsonLd({
      receta: { ...base, created_at: "2019-11-06T23:03" } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "A",
    });
    expect(ld.datePublished).toBe("2019-11-06T23:03:00.000Z");
  });

  it("keeps offsets when the content provides them", () => {
    const ld = buildRecipeJsonLd({
      receta: { ...base, created_at: "2019-11-06T23:03:00-04:00" } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "A",
    });
    expect(ld.datePublished).toBe("2019-11-07T03:03:00.000Z");
  });

  it("groups preparación under its headings as HowToSection", () => {
    const ld = buildRecipeJsonLd({
      receta: {
        ...base,
        preparacion: node("Empezar por la salsa.\n### La Salsa:\n- Sofreír\n- Licuar\n### El Montaje:\n- Capas alternadas"),
      } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "A",
    });
    expect(ld.recipeInstructions).toEqual([
      { "@type": "HowToStep", text: "Empezar por la salsa." },
      {
        "@type": "HowToSection",
        name: "La Salsa:",
        itemListElement: [
          { "@type": "HowToStep", text: "Sofreír" },
          { "@type": "HowToStep", text: "Licuar" },
        ],
      },
      {
        "@type": "HowToSection",
        name: "El Montaje:",
        itemListElement: [{ "@type": "HowToStep", text: "Capas alternadas" }],
      },
    ]);
  });

  it("omits image for photo-less recipes (never invents a placeholder)", () => {
    const ld = buildRecipeJsonLd({
      receta: { ...base, photo: null } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "Antonio Bonnet",
    });
    expect(ld).not.toHaveProperty("image");
    expect(ld).not.toHaveProperty("recipeCategory");
    expect(ld).not.toHaveProperty("keywords");
  });

  it("omits unparseable dates instead of emitting garbage", () => {
    const ld = buildRecipeJsonLd({
      receta: { ...base, created_at: "no-es-fecha", updated_at: null } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "Antonio Bonnet",
    });
    expect(ld).not.toHaveProperty("datePublished");
    expect(ld).not.toHaveProperty("dateModified");
  });

  it("omits ingredient/instruction keys when those fields are empty", () => {
    const ld = buildRecipeJsonLd({
      receta: { ...base, ingredientes: null, preparacion: null } as never,
      url: "https://www.bongusto.net/receta/1/ratatouille",
      categorias: [],
      author: "Antonio Bonnet",
    });
    expect(ld).not.toHaveProperty("recipeIngredient");
    expect(ld).not.toHaveProperty("recipeInstructions");
  });
});
