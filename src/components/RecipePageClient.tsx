"use client";

import MealBrowser from "@/components/MealBrowser";
import FilterMenu from "@/components/FilterMenu";
import ViewRecipePopUp from "@/components/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/CreateRecipePopUp";
import {
  CategoryDisplayType,
  CategoryValue,
  COMBO_CATEGORY_DISPLAY,
  createEmptyFilterSelections,
  FilterSelections,
  RecipePreview,
} from "@/lib/types";
import { useEffect, useState } from "react";
import { useMealData } from "@/hooks/useMealData";
import { Recipe, Combo } from "@/lib/types";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cloneFilterSelections } from "@/lib/helpers";

type BrowserItem = Recipe | Combo<RecipePreview>;
type SelectedItem = Recipe | Combo<Recipe>;

function isRecipe(item: BrowserItem | SelectedItem): item is Recipe {
  return "category" in item;
}

export default function RecipePageClient() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [filters, setFilters] = useState<FilterSelections>(() => createEmptyFilterSelections());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CategoryDisplayType | null>(null);
  const [pageSize, setPageSize] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPageSize(11);
      } else {
        setPageSize(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`/api/recipes/${id}`);

    if (!res.ok) {
      throw new Error(`Failed to get individual recipe (${res.status})`);
    }

    return res.json();
  }

  async function getCombo(id: string): Promise<Combo<Recipe>> {
    const res = await fetch(`/api/combos/${id}?populate=all`);

    if (!res.ok) {
      throw new Error(`Failed to get individual combo (${res.status})`);
    }

    return res.json();
  }

  const { items, loading, error, isComboMode, draftCount, currentPage, totalPages, setCurrentPage } =
    useMealData<RecipePreview>({
      search,
      filters,
      selectedCategories,
      draftMode: false,
      comboPopulate: "preview",
    });

  const handleOpenItem = async (item: BrowserItem) => {
    setMode("view");

    if (isRecipe(item)) {
      setSelectedItem(item);
      setActiveType(null);
      setIsOpen(true);
      return;
    }

    try {
      const combo = await getCombo(item._id);

      setSelectedItem(combo);
      setActiveType(COMBO_CATEGORY_DISPLAY);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id) return;

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
  }, [id]);

  const selectedItemIsCombo = selectedItem ? !isRecipe(selectedItem) : isComboMode;

  return (
    <main className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-auto md:overflow-hidden px-5 pt-5 md:flex-row">
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
        onOpenItem={handleOpenItem}
        filterButton={
          <button
            type="button"
            className="flex items-center gap-2 rounded-md text-pepper md:hidden"
            aria-expanded={mobileFiltersOpen}
            aria-label="Open filters"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <SlidersHorizontal className="h-6 w-6" strokeWidth={2} aria-hidden />
            <span className="font-montserrat text-md font-semibold">Filters</span>
          </button>
        }
      />

      <div className="hidden w-px shrink-0 bg-dark-gray md:block md:self-stretch" />

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 flex h-dvh min-h-0 flex-col bg-white md:hidden">
          <FilterMenu
            mobileOverlay={{ onClose: () => setMobileFiltersOpen(false) }}
            initialSelections={filters}
            onFilterChange={(s) => setFilters(cloneFilterSelections(s))}
          />
        </div>
      ) : (
        <div className="hidden overflow-auto md:block">
          <FilterMenu initialSelections={filters} onFilterChange={(s) => setFilters(cloneFilterSelections(s))} />
        </div>
      )}

      {mode === "view" ? (
        <ViewRecipePopUp
          open={isOpen}
          onClose={setIsOpen}
          item={selectedItem}
          isComboMode={selectedItemIsCombo}
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
