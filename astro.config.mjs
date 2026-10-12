// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";

// Static-first: every route is prerendered at build time.
// SSR-capable routes (Keystatic /admin + its API) opt out with
// `export const prerender = false` — that's why the Netlify adapter is here.
export default defineConfig({
  output: "static",
  adapter: netlify(),
  site: "https://www.bongusto.net",
  server: { port: 4321 },
  integrations: [
    sitemap({
      filter: (page) => !/\/pagina\/1\/?$/.test(page), // canonical home is "/"
    }),
  ],
});
