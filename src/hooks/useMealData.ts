import { useEffect, useMemo, useState } from "react";
import { buildFilterTags, hasCategoryTag } from "@/lib/helpers";
import { CategoryValue, Combo, FilterSelections, Recipe } from "@/lib/types";

type Params = {
  search: string;
  filters: FilterSelections;
  selectedCategories: Set<CategoryValue>;
  draftMode: boolean;
};

type Return = {
  items: Recipe[] | Combo[];
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  draftCount: number;
  refresh: () => void;
};

export function useMealData({ search, filters, selectedCategories, draftMode }: Params): Return {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const isComboMode = selectedCategories.has("combo");

  /* ---------------- Debounce ---------------- */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------------- Fetch ---------------- */

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const trimmed = debouncedSearch.trim();
        const base = isComboMode ? "/api/combos" : "/api/recipes";

        const params = new URLSearchParams();

        // Draft filtering
        params.append("isDraft", draftMode ? "true" : "false");

        if (trimmed) {
          params.append("name", trimmed);
        } else if (!isComboMode) {
          const tagParams = buildFilterTags(filters);
          tagParams.forEach((t) => params.append("tags", t));
        }

        const url = `${base}?${params.toString()}`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const { data, totalCount } = await res.json();

        if (isComboMode) {
          setCombos(data);
        } else {
          setRecipes(data);
        }

        // Drafts count fetch
        if (draftMode) {
          setDraftCount(totalCount);
        } else {
          const draftParams = new URLSearchParams();
          draftParams.append("isDraft", "true");
          const draftUrl = `${base}?${draftParams.toString()}&limit=1`;
          const draftRes = await fetch(draftUrl, { signal: controller.signal });

          if (!draftRes.ok) {
            throw new Error(`Request failed: ${draftRes.status}`);
          }

          const { totalCount: draftTotal } = await draftRes.json();
          setDraftCount(draftTotal);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [debouncedSearch, filters, isComboMode, draftMode, refreshKey]);

  /* ---------------- Local Category Filtering ---------------- */

  const activeCategories = useMemo(
    () => Array.from(selectedCategories).filter((c) => c !== "combo"),
    [selectedCategories],
  );

  const visibleRecipes = useMemo(() => {
    if (activeCategories.length === 0) return recipes;

    return recipes.filter((recipe) => activeCategories.some((cat) => hasCategoryTag(recipe.tags, cat)));
  }, [recipes, activeCategories]);

  const items = isComboMode ? combos : visibleRecipes;

  return {
    items,
    loading,
    error,
    isComboMode,
    draftCount,
    refresh,
  };
}
