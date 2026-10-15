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

/**
 * Condensed numeral run for the pagination center slot: 1 … 5 6 7 … 21.
 * All pages when they fit (total ≤ 7); otherwise the two ends plus a window
 * of three around the current page, with "gap" markers where numbers were
 * dropped. Callers guarantee 1 ≤ current ≤ total (paginate() clamps;
 * category routes throw on out-of-range pages).
 */
export function buildRun(current: number, total: number): (number | "gap")[] {
  const run: (number | "gap")[] = [];
  if (total <= 7) {
    for (let p = 1; p <= total; p++) run.push(p);
    return run;
  }
  const near = [current - 1, current, current + 1].filter(
    (p) => p > 1 && p < total,
  );
  let prev = 0;
  for (const p of [1, ...near, total]) {
    if (p - prev > 1) run.push("gap");
    run.push(p);
    prev = p;
  }
  return run;
}
