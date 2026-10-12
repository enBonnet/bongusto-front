import { config, fields, collection, singleton } from "@keystatic/core";

// GitHub mode in production (admin edits commit to the repo via the GitHub App),
// local mode for development.
// Gated on the PUBLIC var because this config is also imported into the
// browser bundle by the admin UI (import.meta.env works on both sides).
// Optional chaining: import.meta.env doesn't exist outside Vite (e.g. when
// scripts/verify-reader.mts loads this file via tsx) — that's fine, it only
// means "local storage".
const storage = import.meta.env?.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
  ? {
      kind: "github" as const,
      repo: "enBonnet/bongusto-front",
    }
  : {
      kind: "local" as const,
    };

export default config({
  storage,
  ui: {
    brand: { name: "BonGusto CMS" },
  },
  collections: {
    recetas: collection({
      label: "Recetas",
      slugField: "titulo",
      path: "content/recetas/*",
      format: { data: "yaml" },
      entryLayout: "form",
      schema: {
        titulo: fields.slug({
          name: {
            label: "Título",
            description:
              "Ojo: el título define la URL. Si renombras una receta ya publicada, añade una línea de redirección del slug antiguo al nuevo en public/_redirects.",
          },
          slug: { label: "Identificador (slug)" },
        }),
        id: fields.integer({
          label: "ID numérico",
          description:
            "Número único usado en la URL (/receta/ID/titulo). Para una receta nueva, usa el número más alto existente + 1.",
          validation: { isRequired: true },
        }),
        descripcion: fields.text({
          label: "Descripción corta",
          multiline: true,
          description: "Resumen que aparece en las tarjetas de la portada.",
        }),
        publico: fields.checkbox({
          label: "Publicada",
          description:
            "Desmarcada = borrador (se guarda pero no se muestra en el sitio).",
          defaultValue: false,
        }),
        categorias: fields.array(
          fields.relationship({
            label: "Categoría",
            collection: "categorias",
          }),
          {
            label: "Categorías",
            itemLabel: (props) => props.value ?? "—",
          }
        ),
        photo: fields.object(
          {
            url: fields.url({
              label: "URL de la foto (Cloudinary)",
              description: "Sube la imagen en Cloudinary y pega su URL aquí.",
            }),
            thumb: fields.url({
              label: "URL miniatura (opcional)",
              description: "Versión reducida para listados/SEO (transformación de Cloudinary).",
            }),
            alt: fields.text({
              label: "Texto alternativo",
              defaultValue: "",
            }),
          },
          { label: "Foto" }
        ),
        created_at: fields.datetime({ label: "Creada" }),
        updated_at: fields.datetime({ label: "Actualizada" }),
        historia: fields.markdoc.inline({
          label: "Historia",
          description: "Opcional. Historia del plato.",
        }),
        ingredientes: fields.markdoc.inline({
          label: "Ingredientes",
          description: "Opcional. Lista de ingredientes (Markdown).",
        }),
        preparacion: fields.markdoc.inline({
          label: "Preparación",
          description: "Opcional. Pasos de preparación (Markdown).",
        }),
      },
    }),

    categorias: collection({
      label: "Categorías",
      slugField: "nombre",
      path: "content/categorias/*",
      format: { data: "yaml" },
      schema: {
        nombre: fields.slug({
          name: { label: "Nombre" },
          slug: { label: "Identificador (slug)" },
        }),
      },
    }),
  },

  singletons: {
    acerca: singleton({
      label: "Acerca de mí",
      path: "content/acerca/acerca",
      format: { data: "yaml" },
      schema: {
        biografia: fields.markdoc.inline({ label: "Biografía" }),
        cursos: fields.markdoc.inline({ label: "Cursos" }),
        photo: fields.object(
          {
            url: fields.url({
              label: "URL de la foto (Cloudinary)",
            }),
            alt: fields.text({ label: "Texto alternativo", defaultValue: "" }),
          },
          { label: "Foto de perfil" }
        ),
      },
    }),
  },
});
