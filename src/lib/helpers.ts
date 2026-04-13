import { FilterSelections } from "./types";

export function buildFilterTags(filters: FilterSelections) {
  const out: string[] = [];

  for (const set of Object.values(filters)) {
    for (const v of Array.from(set)) {
      out.push(v.trim().toLowerCase());
    }
  }

  return Array.from(new Set(out));
}
