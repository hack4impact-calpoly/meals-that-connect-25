"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import {
  CategoryDisplayType,
  CategoryValue,
  COMBO_CATEGORY_DISPLAY,
  createEmptyFilterSelections,
  FilterSelections,
} from "@/lib/types";
import { useEffect, useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cloneFilterSelections } from "@/lib/helpers";

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [filters, setFilters] = useState<FilterSelections>(() => createEmptyFilterSelections()); // Lazy initializer, only used on first render.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Recipe | Combo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CategoryDisplayType | null>(null);

  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error(`Failed to get individual recipe (${res.status})`);
    return res.json();
  }

  const { items, loading, error, isComboMode, draftCount, currentPage, totalPages, setCurrentPage } = useMealData({
    search,
    filters,
    selectedCategories,
    draftMode: false,
  });

  const handleOpenItem = (item: Recipe | Combo) => {
    setSelectedItem(item);
    setIsOpen(true);
    setActiveType(isComboMode ? COMBO_CATEGORY_DISPLAY : null);
  };

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
        isComboMode={isComboMode}
        draftCount={draftCount}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        draftMode={false}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        onOpenItem={handleOpenItem}
        filterButton={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md text-pepper md:hidden"
            aria-expanded={mobileFiltersOpen}
            aria-label="Open filters"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-6 w-6" strokeWidth={2} aria-hidden />
            <span className="font-montserrat text-md font-semibold">Filters</span>
          </button>
        }
      />

      <div className="hidden w-px shrink-0 bg-dark-gray md:block md:self-stretch" />

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex h-dvh min-h-0 flex-col bg-white md:hidden">
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
          isComboMode={isComboMode}
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
