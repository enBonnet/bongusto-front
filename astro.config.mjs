// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";

// Static-first: every route is prerendered at build time.
// The Keystatic integration injects two SSR routes (admin UI + API at
// /keystatic and /api/keystatic) — that's why the Netlify adapter is here.
export default defineConfig({
  output: "static",
  adapter: netlify(),
  site: "https://www.bongusto.net",
  server: { port: 4321 },
  integrations: [
    react(),
    keystatic(),
    sitemap({
      filter: (page) => !/\/pagina\/1\/?$/.test(page), // canonical home is "/"
    }),
  ],
});
