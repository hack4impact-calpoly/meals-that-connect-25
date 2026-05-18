"use client";

import DraggableRecipeCard from "./DraggableRecipeCard";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import PaginationDisplay from "@/components/PaginationDisplay";
import { CATEGORY_DISPLAY, CategoryValue, Combo, Recipe } from "@/lib/types";

interface RecipeDatabaseProps {
  items: Recipe[] | Combo[];
  loading: boolean;
  error: string | null;
  onSearch: (value: string) => void;
  selectedCategories: Set<CategoryValue>;
  onToggleCategory: (category: CategoryValue) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RecipeDatabase({
  items,
  loading,
  error,
  onSearch,
  selectedCategories,
  onToggleCategory,
  currentPage,
  totalPages,
  onPageChange,
}: RecipeDatabaseProps) {
  return (
    <div className="flex min-h-0 flex-col overflow-auto rounded-md bg-white p-4 shadow-sm sm:p-6 lg:rounded-none lg:shadow-none">
      <div className="mb-3 font-montserrat text-lg font-bold text-pepper sm:mb-5 sm:text-xl">Recipe Database</div>

      <div className="flex min-w-0 flex-row items-center gap-2 sm:gap-4">
        <SearchBarClient placeholder="Search a recipe" onSearch={onSearch} />
      </div>

      <div className="my-4 overflow-x-auto pb-1">
        <CategoryToggle
          options={CATEGORY_DISPLAY}
          selectedCategories={selectedCategories}
          onToggle={onToggleCategory}
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      <div className="flex min-h-0 flex-col gap-3 overflow-auto sm:gap-4">
        {items.map((item) => (
          <DraggableRecipeCard key={item._id} item={item} />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <PaginationDisplay
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          disabled={loading}
        />
      </div>
    </div>
  );
}
