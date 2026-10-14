/**
 * Bookmarks live in the reader's own browser (localStorage): the site has no
 * accounts. Each entry keeps just what the "Guardadas" page needs to draw a
 * card, so that page works without fetching anything.
 */
const KEY = "bongusto:guardadas";
export const SAVED_EVENT = "bongusto:saved-change";

export interface SavedRecipe {
  id: number;
  titulo: string;
  url: string;
  img?: string;
  dept?: string;
}

const isSavedRecipe = (v: unknown): v is SavedRecipe => {
  const r = v as SavedRecipe;
  return (
    !!r &&
    typeof r.id === "number" &&
    typeof r.titulo === "string" &&
    typeof r.url === "string" &&
    r.url.startsWith("/receta/")
  );
};

export function readSaved(): SavedRecipe[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isSavedRecipe) : [];
  } catch {
    return [];
  }
}

function write(list: SavedRecipe[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Storage blocked (private mode, quota): the caller re-reads, so the UI
    // shows the truth instead of pretending the save worked.
  }
  document.dispatchEvent(new CustomEvent(SAVED_EVENT));
}

export const isSaved = (id: number) => readSaved().some((r) => r.id === id);

/** Toggle a recipe; returns whether it is saved afterwards. */
export function toggleSaved(item: SavedRecipe): boolean {
  const list = readSaved();
  write(list.some((r) => r.id === item.id) ? list.filter((r) => r.id !== item.id) : [item, ...list]);
  return isSaved(item.id);
}

export function removeSaved(id: number) {
  write(readSaved().filter((r) => r.id !== id));
}

/** Run `fn` now and whenever the list changes here or in another tab. */
export function onSavedChange(fn: () => void) {
  fn();
  document.addEventListener(SAVED_EVENT, fn);
  window.addEventListener("storage", (e) => {
    if (e.key === KEY || e.key === null) fn();
  });
}
