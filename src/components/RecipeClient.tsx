"use client";

import * as React from "react";
import CategoryToggle, { type CategoryOption } from "@/components/CategoryToggle";
import SearchBarClient from "@/components/SearchbarClient";
import AddItemButton from "@/components/AddItem";
import RecipeCard from "@/components/RecipeCard";
import FilterMenu from "@/components/FilterMenu";

type Recipe = {
  id: string;
  name: string;
  imageUrl?: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
};

type FilterSelections = Record<string, Set<string>>;

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

/*update page results on changes to search bar or filter*/
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function buildTags({ category, search, filters }: { category: string; search: string; filters: FilterSelections }) {
  const out: string[] = [];

  // add category as tag
  if (category !== "all") out.push(category.toLowerCase());

  // add all filter selections to tags
  for (const set of Object.values(filters)) {
    for (const v of Array.from(set)) {
      out.push(v.trim().toLowerCase());
    }
  }

  //add search terms as tags
  const tokens = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  out.push(...tokens);

  return Array.from(new Set(out));
}

function normalizeRecipe(raw: any): Recipe {
  return {
    id: raw?.id ?? raw?._id ?? crypto.randomUUID(),
    name: raw?.name ?? raw?.title ?? "Untitled",
    imageUrl: raw?.imageUrl,
    calories: raw?.calories,
    servingSize: raw?.servingSize,
    tags: raw?.tags ?? [],
  };
}

export default function RecipesClient() {
  const [category, setCategory] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const [filters, setFilters] = React.useState<FilterSelections>(EMPTY_FILTERS);

  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);

  const categoryOptions: CategoryOption[] = [
    { value: "all", label: "All" },
    { value: "combos", label: "Combos" },
    { value: "entrees", label: "Entrées" },
    { value: "sides", label: "Sides" },
    { value: "fruit", label: "Fruit" },
  ];

  // Build query params
  const queryString = React.useMemo(() => {
    const params = new URLSearchParams();

    const tags = buildTags({
      category,
      search: debouncedSearch,
      filters,
    });

    for (const tag of tags) params.append("tags", tag);

    return params.toString();
  }, [category, debouncedSearch, filters]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const url = queryString ? `/api/recipes?${queryString}` : "/api/recipes";
        const res = await fetch(url, { signal: controller.signal });

        if (res.status === 404) {
          setRecipes([]);
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const json = await res.json();

        const list = Array.isArray(json?.data) ? json.data : [];
        setRecipes(list.map(normalizeRecipe));
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setError(e?.message ?? "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [queryString]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Top row: search + actions */}
      <div className="grid grid-cols-12 items-start gap-6">
        {/* Left: search + category pills */}
        <div className="col-span-12 lg:col-span-8">
          <SearchBarClient placeholder="Search a recipe" onSearch={setSearch} />

          <div className="mt-3">
            <CategoryToggle options={categoryOptions} value={category} onChange={setCategory} />
          </div>
        </div>

        {/* Right: buttons */}
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-start gap-3 lg:justify-end">
            <AddItemButton />
            <button className="h-11 rounded-md border border-green-600 bg-white px-4 text-sm font-medium text-green-700">
              View Drafts
            </button>
            <button aria-label="Filters" className="h-11 w-11 rounded-md bg-radish-900 text-white">
              ≡
            </button>
          </div>
        </div>
      </div>

      {/* Main content: cards + divider + filters */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        {/* Cards */}
        <div className="col-span-12 lg:col-span-8">
          {loading ? (
            <div className="text-sm text-black/60">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : recipes.length === 0 ? (
            <div className="text-sm text-black/60">No recipes found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {recipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  name={r.name}
                  imageUrl={r.imageUrl}
                  calories={r.calories}
                  servingSize={r.servingSize}
                  tags={r.tags}
                />
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="relative hidden lg:col-span-1 lg:block">
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/10" />
        </div>

        {/* Filters */}
        <aside className="col-span-12 lg:col-span-3">
          <h2 className="text-sm font-semibold">Filters</h2>
          <div className="mt-3">
            <FilterMenu onFilterChange={setFilters} />
          </div>
        </aside>
      </div>
    </div>
  );
}
