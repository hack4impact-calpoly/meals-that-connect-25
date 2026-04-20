"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import { CategoryValue, FilterSelections, Subrecipe } from "@/lib/types";
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

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  // automatic selection of combo category when page loads!
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
  }, []);

  return (
    <main className="flex flex-col md:flex-row px-5 pt-5 gap-6 overflow-hidden">
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
