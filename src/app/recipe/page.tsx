"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import { CategoryValue, FilterSelections } from "@/lib/types";
import { useState } from "react";
import { useMealData } from "@/hooks/useMealData";

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
  const [search, setSearch] = useState("");

  const { items, loading, error, isComboMode, draftCount, currentPage, totalPages, setCurrentPage } = useMealData({
    search,
    filters,
    selectedCategories,
    draftMode: false,
  });

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
      />

      <div className="hidden md:block w-px bg-dark-gray self-stretch" />

      <div className="overflow-auto">
        <FilterMenu onFilterChange={setFilters} />
      </div>
    </main>
  );
}
