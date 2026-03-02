"use client";

import { useState } from "react";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import CardGrid from "@/components/CardGrid";
import AddNewRecipeButton from "@/components/AddNewRecipeButton";

import { useMealData } from "@/hooks/useMealData";
import { CategoryValue, FilterSelections } from "@/lib/types";

type Props = {
  draftMode: boolean;
  filters: FilterSelections;
  selectedIds?: Set<string>;
  selectedCategories: Set<CategoryValue>;
  toggleCategory: (category: CategoryValue) => void;
  onToggleSelect?: (id: string, name: string) => void;
  topLeftChildren?: React.ReactNode; // top-left slot for an extra button
  topRightChildren?: React.ReactNode; // for additional buttons after search bar
};

const categoryOptions: Array<{ value: CategoryValue; label: string }> = [
  { value: "combo", label: "Combos" },
  { value: "entree", label: "Entrées" },
  { value: "side", label: "Sides" },
  { value: "fruit", label: "Fruits" },
];

export default function MealBrowser({
  draftMode,
  filters,
  topLeftChildren,
  topRightChildren,
  selectedIds,
  selectedCategories,
  toggleCategory,
  onToggleSelect,
}: Props) {
  const [search, setSearch] = useState("");

  const { items, loading, error, isComboMode, draftCount } = useMealData({
    search,
    filters,
    selectedCategories,
    draftMode,
  });

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex gap-5 items-center">
        {topLeftChildren}
        <SearchBarClient placeholder="Search a recipe" onSearch={setSearch} />
        {topRightChildren}
        <AddNewRecipeButton />
      </div>

      <CategoryToggle options={categoryOptions} selectedCategories={selectedCategories} onToggle={toggleCategory} />

      <div className="overflow-auto">
        <CardGrid
          loading={loading}
          error={error}
          isComboMode={isComboMode}
          items={items}
          draftMode={draftMode}
          draftCount={draftCount}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>
    </div>
  );
}
