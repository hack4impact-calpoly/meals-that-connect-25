"use client";

import * as React from "react";
import SearchBarClient from "@/components/SearchbarClient";
import AddItemButton from "@/components/AddItem";
import RecipeCard from "@/components/RecipeCard";
import FilterMenu from "@/components/FilterMenu";
import AddNewRecipeButton from "./AddNewRecipeButton";

type Recipe = {
  id: string;
  name: string;
  imageUrl?: string;
  calories?: number;
  servingSize?: string;
  tags?: string[];
};

type FilterSelections = Record<string, Set<string>>;
type CategoryValue = "entree" | "side" | "fruit" | "combo";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

const categoryOptions: Array<{ value: CategoryValue; label: string }> = [
  { value: "combo", label: "Combo" },
  { value: "entree", label: "Entree" },
  { value: "fruit", label: "Fruit" },
  { value: "side", label: "Side" },
];
const categoryButtonBaseClass =
  "inline-flex items-center rounded-full border border-radish-900 bg-white px-3 py-1 text-sm font-medium text-radish-900 transition-colors hover:bg-radish-900 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-radish-900";
const categoryButtonSelectedClass = "!bg-radish-900 !text-white";

/*update page results on changes to search bar or filter*/
function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function buildTags({ search, filters }: { search: string; filters: FilterSelections }) {
  const out: string[] = [];

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

function normalizeTag(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function hasCategoryTag(tags: string[] = [], category: CategoryValue) {
  const normalizedTags = tags.map((tag) => normalizeTag(tag));
  return normalizedTags.some((tag) => {
    if (category === "combo") return tag.includes("combo");
    if (category === "entree") return tag.includes("entree");
    if (category === "side") return tag.includes("side");
    return tag.includes("fruit");
  });
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
  const [selectedCategories, setSelectedCategories] = React.useState<Set<CategoryValue>>(new Set());
  const [search, setSearch] = React.useState("");

  const [filters, setFilters] = React.useState<FilterSelections>(EMPTY_FILTERS);

  const [recipes, setRecipes] = React.useState<Recipe[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, 250);

  const toggleCategory = React.useCallback((category: CategoryValue) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);

      if (category === "combo") {
        if (next.has("combo")) return new Set<CategoryValue>();
        return new Set<CategoryValue>(["combo"]);
      }

      if (next.has("combo")) next.delete("combo");

      if (next.has(category)) next.delete(category);
      else next.add(category);

      return next;
    });
  }, []);

  // Build query params
  const queryString = React.useMemo(() => {
    const params = new URLSearchParams();

    const tags = buildTags({
      search: debouncedSearch,
      filters,
    });

    for (const tag of tags) params.append("tags", tag);

    return params.toString();
  }, [debouncedSearch, filters]);

  const visibleRecipes = React.useMemo(() => {
    if (selectedCategories.size === 0) return recipes;
    return recipes.filter((recipe) =>
      Array.from(selectedCategories).some((category) => hasCategoryTag(recipe.tags, category)),
    );
  }, [recipes, selectedCategories]);

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
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((option) => {
                const selected = selectedCategories.has(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleCategory(option.value)}
                    className={[categoryButtonBaseClass, selected ? categoryButtonSelectedClass : ""].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: buttons */}
        <div className="col-span-12 lg:col-span-4">
          <div className="flex items-center justify-start gap-3 lg:justify-end">
            <AddNewRecipeButton />
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
          ) : visibleRecipes.length === 0 ? (
            <div className="text-sm text-black/60">No recipes found.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleRecipes.map((r) => (
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
