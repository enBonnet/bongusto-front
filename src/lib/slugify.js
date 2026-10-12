/**
 * Slugify — ported from the original site's src/utils/slugify.js behavior:
 * lowercase, accent-stripped, spaces → dashes, non-word chars removed.
 */
export function slugify(string) {
  return string
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_-]/g, "") // drop non-word chars
    .replace(/[\s_]+/g, "-") // spaces/underscores → dash
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-|-$/g, ""); // trim dashes
}
