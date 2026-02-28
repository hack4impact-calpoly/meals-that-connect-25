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
  onToggleSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  const { items, loading, error, isComboMode } = useMealData({
    search,
    filters,
    selectedCategories,
    draftMode,
  });

  const toggleCategory = (category: CategoryValue) => {
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
  };

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
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
        />
      </div>
    </div>
  );
}
