// @ts-check
import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";

// Static-first: every route is prerendered at build time.
// The Keystatic integration injects two SSR routes (admin UI + API at
// /keystatic and /api/keystatic) — that's why the Netlify adapter is here.
// Mount the CMS admin only when it can be secured: in local dev, or in
// builds that have the GitHub App slug set. Deploy contexts without the
// env var must NOT ship the (unauthenticated, local-mode) admin routes.
const mountKeystaticAdmin = Boolean(
  process.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG || process.env.NODE_ENV !== "production"
);

export default defineConfig({
  output: "static",
  adapter: netlify(),
  site: "https://www.bongusto.net",
  server: { port: 4321 },
  integrations: [
    react(),
    ...(mountKeystaticAdmin ? [keystatic()] : []),
    sitemap({
      // canonical home is "/" and the search UI has no indexable value
      filter: (page) => !/\/pagina\/1\/?$/.test(page) && !/\/buscar\/?$/.test(page),
    }),
  ],
});
