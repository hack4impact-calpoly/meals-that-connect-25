"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import DraggableRecipeCard from "./DraggableRecipeCard";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import PaginationDisplay from "@/components/PaginationDisplay";
import { CategoryValue, Combo, Recipe } from "@/lib/types";

type SortOption = "lastUpdated" | "createdDate" | "aToZ" | "zToA";

interface RecipeDatabaseItem {
  _id?: string;
  id?: string;
  name: string;
  serving?: number;
  tags?: string[];
  itemType?: "recipe" | "combo";
}

interface RecipeDatabaseProps {
  items: Recipe[] | Combo[];
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

const categoryOptions: Array<{ value: CategoryValue; label: string }> = [
  { value: "Combo", label: "Combos" },
  { value: "Entree", label: "Entrées" },
  { value: "Side", label: "Sides" },
  { value: "Fruit", label: "Fruits" },
];

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "lastUpdated", label: "Last Updated" },
  { value: "createdDate", label: "Created Date" },
  { value: "aToZ", label: "A to Z" },
  { value: "zToA", label: "Z to A" },
];

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
    <div className="p-6 h-full">
      <div className="text-xl font-semibold mb-6">Recipe Database</div>

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
              {sortOptions.map((option) => (
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
        <CategoryToggle<CategoryValue>
          options={categoryOptions}
          selectedCategories={selectedCategories}
          onToggle={onToggleCategory}
        />
      </div>

      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}

      <div className="flex flex-col gap-4">
        {items.map((item, index) => {
          const displayItem = item as {
            id?: string;
            _id?: string;
            name?: string;
            tags?: string[];
            filters?: string[];
            nutritional_info?: { calories?: number };
            serving?: number;
          };

          return (
            <DraggableRecipeCard
              recipeId={String(displayItem.id ?? displayItem._id ?? "")}
              key={displayItem.id ?? displayItem._id ?? index}
              imageUrl={""}
              name={displayItem.name ?? "Untitled"}
              calories={displayItem.nutritional_info?.calories ?? 0}
              servingSize={displayItem.serving ? `${displayItem.serving}g` : "100g"}
              tags={displayItem.tags ?? displayItem.filters ?? []}
            />
          );
        })}
      </div>

      <div className="flex justify-center mt-4">
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
