import { useEffect, useState } from "react";
import { buildFilterTags } from "@/lib/helpers";
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
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  refresh: () => void;
};

const PAGE_SIZE = 10;

export function useMealData({ search, filters, selectedCategories, draftMode }: Params): Return {
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

  const isComboMode = selectedCategories.has("combo");

  /* ---------------- Debounce ---------------- */

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, selectedCategories, isComboMode, draftMode]);

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
        } else {
          const tagParams = buildFilterTags(filters);
          tagParams.forEach((t) => params.append("tags", t));
        }

        if (!isComboMode) {
          const categoryParams = Array.from(selectedCategories).filter((category) => category !== "combo");
          categoryParams.forEach((category) => params.append("categories", category));
        }

        const url = `${base}?${params.toString()}`;

        const paginatedUrl = `${url}&page=${currentPage}&limit=${PAGE_SIZE}`;
        const res = await fetch(paginatedUrl, { signal: controller.signal });

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
  }, [currentPage, debouncedSearch, filters, selectedCategories, isComboMode, draftMode, refreshKey]);

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
