# BonGusto

Recetas de comida latinoamericana con un poco de historia — blog estático con CMS embebido ([Astro](https://astro.build) + [Keystatic](https://keystatic.com)).

## Stack

- **Astro** (`output: "static"`) — todas las páginas se prerenderizan en build
- **Keystatic** — editor de contenido; en local escribe YAML en `content/`, en producción puede usar modo GitHub (requiere `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` + credenciales OAuth)
- **Pagefind** — índice de búsqueda generado en build (`/buscar`)
- **Cloudinary** — todas las fotos (transformaciones on-the-fly via URL)
- **Netlify** — hosting (deploy por push a `master`; ver `netlify.toml`)

## Desarrollo

```bash
nvm use            # Node 22 (ver .nvmrc)
npm ci
npm run dev        # http://localhost:4321
```

El CMS vive en `http://localhost:4321/keystatic` (modo local: los cambios escriben YAML directo en `content/`). Recetas con `publico: false` son borradores y no se renderizan.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con CMS |
| `npm run build` | Build estático + índice Pagefind |
| `npm run preview` | Sirve `dist/` para revisar el build local |
| `npm test` | Tests unitarios (vitest) |
| `npm run verify:reader` | Verifica integridad del contenido vía Reader API |
| `npm run audit:redirects -- <url>` | Audita que todas las URLs del sitio viejo resuelvan en el deploy indicado, p. ej. `npm run audit:redirects -- https://preview.netlify.app` (gate pre-cutover) |
| `npm run recover` / `transform` | Rescate/transformación de datos crudos (`data/raw/` → `content/`) — herramientas de la migración, no del día a día |

## Contenido y URLs

- `content/recetas/{id}-{slug}.yaml` — el `id` es la clave canónica de la URL (`/receta/{id}/{slug}`); el slug es decorativo
- `content/categorias/*.yaml` — categorías de navegación
- `content/acerca/acerca.yaml` — página "Acerca de mí"
- Redirecciones de URLs legadas en `public/_redirects` (sintaxis Netlify); `/pagina/1` redirige a `/`
- Datos crudos de la migración en `data/raw/` (fuente de verdad histórica)

## Deploy

Push a `master` → Netlify compila (`npm run build`) y publica `dist/`. Las cabeceras de seguridad y el caching inmutable de Pagefind están en `netlify.toml`; el caching inmutable de `/_astro/*` lo aplica Netlify automáticamente.

CI (`.github/workflows/ci.yml`) corre tests + verificación de contenido + build en cada PR y push.
