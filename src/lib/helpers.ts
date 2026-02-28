import { CategoryValue, FilterSelections } from "./types";

export function buildFilterTags(filters: FilterSelections) {
  const out: string[] = [];

  for (const set of Object.values(filters)) {
    for (const v of Array.from(set)) {
      out.push(v.trim().toLowerCase());
    }
  }

  return Array.from(new Set(out));
}

export function normalizeTag(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function hasCategoryTag(tags: string[] = [], category: CategoryValue) {
  const normalizedTags = tags.map((t) => normalizeTag(t));

  return normalizedTags.some((tag) => {
    if (category === "combo") return tag.includes("combo");
    if (category === "entree") return tag.includes("entree");
    if (category === "side") return tag.includes("side");
    return tag.includes("fruit");
  });
}
