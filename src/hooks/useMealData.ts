import { useEffect, useState } from "react";
import { CategoryValue, Combo, FilterSelections, Recipe, SortOption } from "@/lib/types";

type Params = {
  search: string;
  filters: FilterSelections;
  selectedCategories: Set<CategoryValue>;
  draftMode: boolean;
  sortBy?: SortOption;
  pageSize?: number;
};

type Return = {
  items: Recipe[] | Combo[];
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  draftCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  refresh: () => void;
};

function appendSetParams(params: URLSearchParams, key: string, values?: Set<unknown>) {
  values?.forEach((value) => {
    params.append(key, String(value));
  });
}

export function useMealData({
  search,
  filters,
  selectedCategories,
  draftMode,
  sortBy = "createdDate",
  pageSize = 11,
}: Params): Return {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const isComboMode = selectedCategories.has("Combo");
  const isSubrecipeOnly = filters.additional?.has("isSubrecipe") ?? false;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, selectedCategories, isComboMode, draftMode, sortBy]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const trimmed = debouncedSearch.trim();
        const base = isComboMode ? "/api/combos" : "/api/recipes";

        const params = new URLSearchParams();

        params.append("isDraft", draftMode ? "true" : "false");
        params.append("sortBy", sortBy);
        params.append("page", String(currentPage));
        params.append("limit", String(draftMode ? pageSize - 1 : pageSize));

        if (trimmed) {
          params.append("name", trimmed);
        }

        appendSetParams(params, "proteinSources", filters.proteinSources);
        appendSetParams(params, "dietary", filters.dietary);
        appendSetParams(params, "exclusions", filters.exclusions);
        appendSetParams(params, "servings", filters.servings);

        // Recipe-only filter.
        if (!isComboMode && isSubrecipeOnly) {
          params.append("isSubrecipe", "true");
        }

        // Recipe-only categories.
        if (!isComboMode) {
          const categoryParams = Array.from(selectedCategories).filter((category) => category !== "Combo");

          categoryParams.forEach((category) => {
            params.append("categories", category);
          });
        }

        const res = await fetch(`${base}?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const { data, totalCount, totalPages: serverTotalPages } = await res.json();
        const safeTotalPages = Math.max(1, Number(serverTotalPages) || 0);

        setTotalPages(safeTotalPages);

        if (currentPage > safeTotalPages) {
          setCurrentPage(safeTotalPages);
          return;
        }

        if (isComboMode) {
          setCombos(data);
        } else {
          setRecipes(data);
        }

        if (draftMode) {
          setDraftCount(totalCount);
        } else {
          const draftParams = new URLSearchParams();
          draftParams.append("isDraft", "true");
          draftParams.append("limit", "1");

          const draftRes = await fetch(`${base}?${draftParams.toString()}`, {
            signal: controller.signal,
          });

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
  }, [
    currentPage,
    debouncedSearch,
    filters,
    selectedCategories,
    isComboMode,
    draftMode,
    sortBy,
    refreshKey,
    isSubrecipeOnly,
    pageSize,
  ]);

  const items = isComboMode ? combos : recipes;

  return {
    items,
    loading,
    error,
    isComboMode,
    draftCount,
    currentPage,
    totalPages,
    setCurrentPage,
    refresh,
  };
}
