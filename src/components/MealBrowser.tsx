"use client";

import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import CardGrid from "@/components/CardGrid";
import AddNewRecipeButton from "@/components/AddNewRecipeButton";
import PaginationDisplay from "@/components/PaginationDisplay";
import { CategoryValue, Combo, Recipe } from "@/lib/types";

type Props = {
  setSearch: (s: string) => void;
  items: Recipe[] | Combo[];
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  draftCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;

  draftMode: boolean;
  selectedCategories: Set<CategoryValue>;
  setSelectedCategories: React.Dispatch<React.SetStateAction<Set<CategoryValue>>>;

  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, name: string) => void;
  onOpenItem?: (item: Recipe | Combo) => void;

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
  setSearch,
  items,
  loading,
  error,
  isComboMode,
  draftCount,
  currentPage,
  totalPages,
  setCurrentPage,
  draftMode,
  selectedCategories,
  setSelectedCategories,
  topLeftChildren,
  topRightChildren,
  selectedIds,
  onToggleSelect,
  onOpenItem,
}: Props) {
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

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <CategoryToggle options={categoryOptions} selectedCategories={selectedCategories} onToggle={toggleCategory} />
        <PaginationDisplay
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          disabled={loading}
        />
      </div>

      <div className="pb-5 overflow-auto">
        <CardGrid
          loading={loading}
          error={error}
          isComboMode={isComboMode}
          items={items}
          draftMode={draftMode}
          draftCount={draftCount}
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onOpenItem={onOpenItem}
        />
      </div>
    </div>
  );
}
