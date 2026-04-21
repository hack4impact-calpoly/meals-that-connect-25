import { useEffect, useState } from "react";
import { buildFilterTags } from "@/lib/helpers";
import { CategoryValue, Combo, FilterSelections, Recipe, SortOption, Subrecipe } from "@/lib/types";

type Params = {
  search: string;
  filters: FilterSelections;
  selectedCategories: Set<CategoryValue>;
  draftMode: boolean;
  sortBy?: SortOption;
};

type Return = {
  items: Recipe[] | Combo[] | Subrecipe[];
  loading: boolean;
  error: string | null;
  isCombo: boolean;
  isSubrecipe: boolean;
  draftCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  refresh: () => void;
};

const PAGE_SIZE = 5;

export function useMealData({
  search,
  filters,
  selectedCategories,
  draftMode,
  sortBy = "createdDate",
}: Params): Return {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [subrecipes, setSubrecipes] = useState<Subrecipe[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftCount, setDraftCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const isCombo = selectedCategories.has("Combo");
  const isSubrecipe = selectedCategories.has("Subrecipe");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, selectedCategories, isCombo, isSubrecipe, draftMode, sortBy]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const trimmed = debouncedSearch.trim();
        const base = isCombo ? "/api/combos" : isSubrecipe ? "/api/subrecipes" : "/api/recipes";

        const params = new URLSearchParams();

        params.append("isDraft", draftMode ? "true" : "false");
        params.append("sortBy", sortBy);

        if (trimmed) {
          params.append("name", trimmed);
        } else {
          const tagParams = buildFilterTags(filters);
          tagParams.forEach((t) => {
            if (t.includes("serving")) {
              params.append("servings", t);
            } else {
              params.append("filters", t);
              params.append("allergens", t);
            }
          });
        }

        // recipes and subrecipes only
        if (!isCombo && !isSubrecipe) {
          const categoryParams = Array.from(selectedCategories).filter((category) => category !== "Combo");
          categoryParams.forEach((category) => params.append("categories", category));
        }

        const url = `${base}?${params.toString()}`;

        // if in draft view, change PAGE_SIZE to PAGE_SIZE - 1
        let paginatedUrl;
        if (draftMode) {
          paginatedUrl = `${url}&page=${currentPage}&limit=${PAGE_SIZE - 1}`;
        } else {
          paginatedUrl = `${url}&page=${currentPage}&limit=${PAGE_SIZE}`;
        }
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

        if (isCombo) {
          setCombos(data);
        } else if (isSubrecipe) {
          setSubrecipes(data);
        } else {
          setRecipes(data);
        }

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
  }, [currentPage, debouncedSearch, filters, selectedCategories, isCombo, isSubrecipe, draftMode, sortBy, refreshKey]);

  const items = isCombo ? combos : isSubrecipe ? subrecipes : recipes;

  return {
    items,
    loading,
    error,
    isCombo,
    isSubrecipe,
    draftCount,
    currentPage,
    totalPages,
    setCurrentPage,
    refresh,
  };
}
