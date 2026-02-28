"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import CardGrid from "@/components/CardGrid";
import FilterMenu from "@/components/FilterMenu";
import AddNewRecipeButton from "@/components/AddNewRecipeButton";

import { useMealData } from "@/hooks/useMealData";
import { CategoryValue, FilterSelections } from "@/lib/types";

type Props = {
  draftMode: boolean;
};

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

const categoryOptions: Array<{ value: CategoryValue; label: string }> = [
  { value: "combo", label: "Combos" },
  { value: "entree", label: "Entrées" },
  { value: "side", label: "Sides" },
  { value: "fruit", label: "Fruits" },
];

export default function RecipeClient({ draftMode }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());
  const [filters, setFilters] = useState<FilterSelections>(EMPTY_FILTERS);

  const { items, loading, error, isComboMode } = useMealData({
    search,
    filters,
    selectedCategories,
    draftMode,
  });

  const toggleCategory = (category: CategoryValue) => {
    setSelectedCategories((prev) => {
      const next = new Set<CategoryValue>(prev);

      if (category === "combo") {
        if (next.has("combo")) return new Set<CategoryValue>();
        return new Set<CategoryValue>(["combo"]);
      }

      if (next.has("combo")) next.delete("combo");

      if (next.has(category)) next.delete(category);
      else next.add(category);

      return next;
    });
  };

  const handleBack = () => router.push("/recipe");

  return (
    <main className="flex flex-col md:flex-row px-5 pt-5 gap-6 overflow-hidden">
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex gap-5 items-center">
          {draftMode && (
            // TODO: Style this button properly
            <button
              onClick={handleBack}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          )}

          <SearchBarClient placeholder="Search a recipe" onSearch={setSearch} />

          <AddNewRecipeButton />
        </div>

        <CategoryToggle options={categoryOptions} selectedCategories={selectedCategories} onToggle={toggleCategory} />

        {/* TODO: add selection checkbox to the draft variant of RecipeCard */}
        {/* TODO: figure out how to add a scrollbar gutter (or hope for pagination)
              I tried pr-4, which works, but it permanently misaligns the grid and search bar */}
        {/* TODO: Consider setting a max-w and min-w for RecipeCard, allow for more than 2 cols on wide screen
              Current responsiveness is in a sad state */}
        <div className="overflow-auto">
          <CardGrid loading={loading} error={error} isComboMode={isComboMode} items={items} draftMode={draftMode} />
        </div>
      </div>

      {!draftMode && (
        <>
          <div className="hidden md:block w-px bg-dark-gray self-stretch" />
          <div className="overflow-auto">
            <FilterMenu onFilterChange={setFilters} />
          </div>
        </>
      )}
      {/* TODO: footer with names for multiselection*/}
    </main>
  );
}
