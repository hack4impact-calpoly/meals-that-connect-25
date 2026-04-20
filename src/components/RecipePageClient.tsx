"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import { CategoryValue, EMPTY_FILTERS, FilterSelections, Subrecipe } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { CreateRecipeType } from "@/components/CreateRecipePopUp";
import { Menu, Utensils } from "lucide-react";
import { useSearchParams } from "next/navigation";

function cloneFilterSelections(f: FilterSelections): FilterSelections {
  const out: FilterSelections = {};
  for (const key of Object.keys(f)) {
    out[key] = new Set(f[key]);
  }
  return out;
}

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [filters, setFilters] = useState<FilterSelections>(EMPTY_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Recipe | Combo | Subrecipe | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CreateRecipeType | null>(null);

  const handleOpenItem = (item: Recipe | Combo | Subrecipe) => {
    setSelectedItem(item);
    setIsOpen(true);
    setActiveType(isCombo ? { id: "Combo", label: "Add Combo", icon: Utensils } : null);
  };


  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(`Failed to get individual recipe (${res.status})`);
    return res.json();
  }

  const { items, loading, error, isCombo, isSubrecipe, draftCount, currentPage, totalPages, setCurrentPage } =
    useMealData({
      search,
      filters,
      selectedCategories,
      draftMode: false,
    });

  useEffect(() => {
    if (!id || id === "") return;
    // fetch recipe item
    getRecipe(id)
      .then((recipe) => {
        setSelectedItem(recipe);
        setIsOpen(true);
        setActiveType(null);
        setMode("view");
      })
      .catch((err) => {
        console.error(err);
      });
  }, [id]);

  return (
    <main className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 pt-5 md:flex-row">
      <MealBrowser
        setSearch={setSearch}
        items={items}
        loading={loading}
        error={error}
        isCombo={isCombo}
        isSubrecipe={isSubrecipe}
        draftCount={draftCount}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        draftMode={false}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        onOpenItem={handleOpenItem}
        topRightChildren={
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-medium-gray bg-white text-pepper md:hidden"
            aria-expanded={mobileFiltersOpen}
            aria-label="Open filters"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
          </button>
        }
      />

      <div className="hidden w-px shrink-0 bg-dark-gray md:block md:self-stretch" />

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex h-[100dvh] min-h-0 flex-col bg-white md:hidden">
          <FilterMenu
            mobileOverlay={{ onClose: () => setMobileFiltersOpen(false) }}
            initialSelections={filters}
            onFilterChange={(s) => setFilters(cloneFilterSelections(s))}
          />
        </div>
      ) : (
        <div className="hidden overflow-auto md:block">
          <FilterMenu initialSelections={filters} onFilterChange={(s) => setFilters(cloneFilterSelections(s))} />
        </div>
      )}

      {mode === "view" ? (
        <ViewRecipePopUp
          open={isOpen}
          onClose={setIsOpen}
          item={selectedItem}
          isComboMode={isCombo}
          changeMode={(e) => setMode(e)}
        />
      ) : (
        <CreateRecipePopUp
          item={selectedItem}
          open={isOpen}
          onClose={() => {
            setIsOpen(false);
            setMode("view");
          }}
          recipeType={activeType}
          editMode={true}
        />
      )}
    </main>
  );
}
