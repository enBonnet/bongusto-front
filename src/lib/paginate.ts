export const PER_PAGE = 15;

/**
 * Paginate recipes newest-first (highest id first), matching the
 * pagination scheme of the production site being replaced (/pagina/N).
 */
export function paginate<T>(
  items: T[],
  page: number
): { items: T[]; current: number; total: number } {
  const total = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const current = Math.min(Math.max(1, page), total);
  const start = (current - 1) * PER_PAGE;
  return { items: items.slice(start, start + PER_PAGE), current, total };
}

export const sortedRecetas = <T extends { id: number }>(recetas: T[]): T[] =>
  [...recetas].sort((a, b) => b.id - a.id);
