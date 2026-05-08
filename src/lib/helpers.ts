import { Dispatch, SetStateAction } from "react";
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

export function toggleCategory(
  category: CategoryValue,
  setSelectedCategories: Dispatch<SetStateAction<Set<CategoryValue>>>,
) {
  setSelectedCategories((prev) => {
    if (category === "Combo") {
      return new Set<CategoryValue>(["Combo"]);
    }

    const next = new Set<CategoryValue>(prev);

    next.delete("Combo");

    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }

    if (next.size === 0) {
      return new Set<CategoryValue>(["Combo"]);
    }

    return next;
  });
}
