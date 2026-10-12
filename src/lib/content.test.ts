import { describe, expect, it } from "vitest";
import Markdoc from "@markdoc/markdoc";
import { recetaCardImage, recetaHeroImage, renderMarkdoc } from "./content";

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

  it("requests the stored thumb transformation at card resolution", () => {
    const src = recetaCardImage({
      photo: {
        url: `${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`,
        thumb: `${cloudinaryBase}/w_100,h_100,c_thumb/nzzlltblm8rfco38t1ao`,
        alt: "x",
      },
    });
    expect(src).toBe(`${cloudinaryBase}/w_600,h_600,c_thumb/nzzlltblm8rfco38t1ao`);
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

  it("does not rewrite Cloudinary thumbs with a different transformation", () => {
    const src = recetaCardImage({
      photo: {
        url: `${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`,
        thumb: `${cloudinaryBase}/w_200,h_200,c_thumb/nzzlltblm8rfco38t1ao`,
        alt: "",
      },
    });
    expect(src).toBe(`${cloudinaryBase}/v1573170326/nzzlltblm8rfco38t1ao.jpg`);
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
    expect(src).toBe(`${cloudinaryBase}/w_600,h_450,c_fill/v1573170326/nzzlltblm8rfco38t1ao.jpg`);
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
