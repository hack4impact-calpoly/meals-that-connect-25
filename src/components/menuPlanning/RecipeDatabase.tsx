"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { SlidersHorizontal } from "lucide-react";
import DraggableRecipeCard from "./DraggableRecipeCard";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import PaginationDisplay from "@/components/PaginationDisplay";
import { CATEGORY_DISPLAY, CategoryValue, Combo, Recipe, SORT_OPTIONS, SortOption } from "@/lib/types";

interface RecipeDatabaseProps {
  items: Array<Recipe | Combo>;
  loading: boolean;
  error: string | null;
  onSearch: (value: string) => void;
  selectedCategories: Set<CategoryValue>;
  onToggleCategory: (category: CategoryValue) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SortCircle({ selected }: { selected: boolean }) {
  return (
    <span className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-radish-900">
      {selected && <span className="h-2 w-2 rounded-full bg-radish-900" />}
    </span>
  );
}

export default function RecipeDatabase({
  items,
  loading,
  error,
  onSearch,
  selectedCategories,
  onToggleCategory,
  sortBy,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
}: RecipeDatabaseProps) {
  return (
    <div className="h-full p-6">
      <div className="mb-6 text-xl font-semibold">Recipe Database</div>

      <div className="flex flex-row items-center gap-4">
        <SearchBarClient placeholder="Search a recipe" onSearch={onSearch} />

        <Menu as="div" className="relative">
          <MenuButton className="rounded-lg bg-radish-900 p-2">
            <SlidersHorizontal className="cursor-pointer" color="white" size={24} strokeWidth={1.7} />
          </MenuButton>

          <MenuItems
            transition
            className="absolute right-0 z-50 mt-3 w-40 origin-top-right rounded-xl bg-white p-4 shadow-md outline-none
                       data-closed:scale-95 data-closed:opacity-0
                       data-enter:duration-100 data-leave:duration-75
                       before:absolute before:-top-2 before:right-4 before:h-4 before:w-4 before:rotate-45
                       before:bg-white before:content-['']"
          >
            <div className="mb-2 text-sm font-semibold text-pepper">Sort by:</div>

            <div className="flex flex-col gap-2">
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value}>
                  <button
                    type="button"
                    onClick={() => onSortChange(option.value)}
                    className="flex w-full items-center gap-2 text-left text-sm text-pepper data-focus:text-radish-900"
                  >
                    <SortCircle selected={sortBy === option.value} />
                    <span>{option.label}</span>
                  </button>
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      <div className="my-4">
        <CategoryToggle
          options={CATEGORY_DISPLAY}
          selectedCategories={selectedCategories}
          onToggle={onToggleCategory}
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      <div className="flex flex-col gap-4">
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
