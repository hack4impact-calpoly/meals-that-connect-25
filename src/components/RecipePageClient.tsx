"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import MobileFilterDisplay from "@/components/MobileFilterDisplay";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import { CategoryValue, FilterSelections } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { CreateRecipeType } from "@/components/CreateRecipePopUp";
import { Utensils, SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // automatic selection of combo category when page loads!
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Recipe | Combo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CreateRecipeType | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleOpenItem = (item: Recipe | Combo) => {
    setSelectedItem(item);
    setIsOpen(true);
    setActiveType(isComboMode ? { id: "Combo", label: "Add Combo", icon: Utensils } : null);
  };

  const handleMobileFilterChange = (sectionId: string, optionId: string) => {
    setFilters((prev) => {
      const next: FilterSelections = { ...prev };
      const nextSet = new Set(next[sectionId] ?? []);

      if (nextSet.has(optionId)) {
        nextSet.delete(optionId);
      } else {
        nextSet.add(optionId);
      }

      next[sectionId] = nextSet;
      return next;
    });
  };

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
  }, []);

  return (
    <main className="flex flex-col md:flex-row px-4 md:px-5 pt-4 md:pt-5 gap-6 overflow-y-auto md:overflow-hidden min-h-screen md:min-h-0">
      <div className="flex-1 min-w-0">
        {/* Mobile Filter Display */}
        <MobileFilterDisplay selections={filters} onFilterChange={handleMobileFilterChange} />

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
              onClick={() => setShowFilters(!showFilters)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition text-sm font-medium"
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-700" />
              <span>Filters</span>
            </button>
          }
        />
      </div>

      <div className="hidden md:block w-px bg-dark-gray self-stretch" />

      {showFilters && (
        <div className="md:block md:overflow-auto">
          <FilterMenu onFilterChange={setFilters} />
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
