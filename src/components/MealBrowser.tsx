import type { Dispatch, ReactNode, SetStateAction } from "react";
import SearchBarClient from "@/components/SearchbarClient";
import CategoryToggle from "@/components/CategoryToggle";
import CardGrid from "@/components/CardGrid";
import AddNewRecipeButton from "@/components/AddNewRecipeButton";
import PaginationDisplay from "@/components/PaginationDisplay";
import { CATEGORY_DISPLAY, CategoryValue, Combo, Recipe, RecipePreview } from "@/lib/types";
import { toggleCategory } from "@/lib/helpers";

type Props = {
  setSearch: (s: string) => void;
  items: Recipe[] | Combo<RecipePreview>[];
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  draftCount: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;

  draftMode: boolean;
  selectedCategories: Set<CategoryValue>;
  setSelectedCategories: Dispatch<SetStateAction<Set<CategoryValue>>>;

  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, name: string) => void;
  onOpenItem?: (item: Recipe | Combo<RecipePreview>) => void;

  topLeftChildren?: ReactNode; // top-left slot for an extra button
  topRightChildren?: ReactNode; // for additional buttons after search bar
  filterButton?: ReactNode; // filter button to display on mobile

  userRole: string | null;
};

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
  filterButton,
  selectedIds,
  onToggleSelect,
  onOpenItem,
  userRole,
}: Props) {
  return (
    <div className="flex flex-1 flex-col gap-3 md:gap-4 overflow-hidden">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
        {topLeftChildren}

        <div className="flex w-full items-center gap-3">
          <div className="flex-1">
            <SearchBarClient placeholder="Search a recipe" onSearch={setSearch} />
          </div>

          {(userRole === "Admin" || userRole === "Kitchen Staff") && <AddNewRecipeButton />}

          {topRightChildren}
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex-1">
            <CategoryToggle
              options={CATEGORY_DISPLAY}
              selectedCategories={selectedCategories}
              onToggle={(category) => toggleCategory(category, setSelectedCategories)}
            />
          </div>

          <div className="hidden md:block">
            <PaginationDisplay
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:hidden">
          <div>{filterButton}</div>

          <PaginationDisplay
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
            disabled={loading}
          />
        </div>
      </div>

      <div className="w-full min-h-0 overflow-auto pb-5">
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
          userRole={userRole}
        />
      </div>
    </div>
  );
}
