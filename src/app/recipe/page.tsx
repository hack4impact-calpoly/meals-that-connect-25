"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import { CategoryValue, FilterSelections } from "@/lib/types";
import { useEffect, useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { CreateRecipeType } from "@/components/CreateRecipePopUp";
import { Utensils } from "lucide-react";
import { useSearchParams } from "next/navigation";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export default function RecipePage({ params }: { params: { id: string } }) {
  const id = params.id;

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // automatic selection of combo category when page loads!
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Recipe | Combo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CreateRecipeType | null>(null);

  const handleOpenItem = (item: Recipe | Combo) => {
    setSelectedItem(item);
    setIsOpen(true);
    setActiveType(isComboMode ? { id: "Combo", label: "Add Combo", icon: Utensils } : null);
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
    <main className="flex flex-col md:flex-row px-5 pt-5 gap-6 overflow-hidden">
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
      />

      <div className="hidden md:block w-px bg-dark-gray self-stretch" />

      <div className="overflow-auto">
        <FilterMenu onFilterChange={setFilters} />
      </div>

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
