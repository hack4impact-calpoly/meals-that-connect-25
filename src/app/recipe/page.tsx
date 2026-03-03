"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import { CategoryValue, FilterSelections } from "@/lib/types";
import { useState } from "react";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export default function RecipePage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());

  return (
    <main className="flex flex-col md:flex-row px-5 pt-5 gap-6 overflow-hidden">
      <MealBrowser
        draftMode={false}
        filters={filters}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />

      <div className="hidden md:block w-px bg-dark-gray self-stretch" />

      <div className="overflow-auto">
        <FilterMenu onFilterChange={setFilters} />
      </div>
    </main>
  );
}
