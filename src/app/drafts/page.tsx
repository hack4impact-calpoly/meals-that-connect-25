"use client";

import { useRouter } from "next/navigation";
import MealBrowser from "@/components/recipe/MealBrowser";
import FilterMenu from "@/components/recipe/FilterMenu";
import ViewRecipePopUp from "@/components/recipe/ViewRecipePopUp";
import CreateRecipePopUp from "@/components/recipe/CreateRecipePopUp";
import {
  CategoryDisplayType,
  CategoryValue,
  COMBO_CATEGORY_DISPLAY,
  Combo,
  createEmptyFilterSelections,
  FilterSelections,
  Recipe,
  RecipePreview,
} from "@/lib/types";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, CircleX, CircleCheck, Menu } from "lucide-react";

import { publishCombos, deleteCombos, deleteRecipes, publishRecipes } from "@/app/actions/draftActions";
import { useMealData } from "@/hooks/useMealData";
import { cloneFilterSelections } from "@/lib/helpers";

type BrowserItem = Recipe | Combo<RecipePreview>;
type SelectedItem = Recipe | Combo<Recipe>;

function isRecipe(item: BrowserItem | SelectedItem): item is Recipe {
  return "category" in item;
}

export default function DraftsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [busy, setBusy] = useState<"publish" | "delete" | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set<CategoryValue>(["Combo"]));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterSelections>(() => createEmptyFilterSelections()); // Lazy initializer, only used on first render.
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [activeType, setActiveType] = useState<CategoryDisplayType | null>(null);
  const { items, loading, error, isComboMode, draftCount, currentPage, totalPages, setCurrentPage, refresh } =
    useMealData<RecipePreview>({
      search,
      filters,
      selectedCategories,
      draftMode: true,
      comboPopulate: "preview",
    });

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function getUserRole() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();

          if (data.role !== "Admin" && data.role !== "Kitchen Staff") {
            console.log("Redirecting user due to insufficient permissions");
            router.push("/");
          }

          setUserRole(data.role);
        } else {
          console.error("Failed to fetch user role");
        }
      } catch (error) {
        setUserRole(null);
      }
    }
    getUserRole();
  }, []);

  useEffect(() => {
    setSelectedIds(new Set());
    setSelectedNames({});
    setBusy(null);
  }, [isComboMode]);

  const toggleSelect = (id: string, name: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
        setSelectedNames((names) => {
          const copy = { ...names };
          delete copy[id];
          return copy;
        });
      } else {
        next.add(id);
        setSelectedNames((names) => ({
          ...names,
          [id]: name,
        }));
      }

      return next;
    });
  };

  async function getCombo(id: string): Promise<Combo<Recipe>> {
    const res = await fetch(`/api/combos/${id}?populate=all`);

    if (!res.ok) {
      throw new Error(`Failed to get individual combo (${res.status})`);
    }

    return res.json();
  }

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

  const handleDelete = async () => {
    setShowDeleteModal(true);
    setBusy("delete");
    if (selectedCategories.has("Combo")) {
      await deleteCombos(Array.from(selectedIds));
    } else {
      await deleteRecipes(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    setSelectedNames({});
    refresh();
  };

  const handlePublish = async () => {
    setShowPublishModal(true);
    setBusy("publish");
    if (selectedCategories.has("Combo")) {
      await publishCombos(Array.from(selectedIds));
    } else {
      await publishRecipes(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    setSelectedNames({});
    refresh();
  };

  const selectedItemIsCombo = selectedItem ? !isRecipe(selectedItem) : isComboMode;

  return (
    <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden px-5 pt-5 md:flex-row">
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
          draftMode={true}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onOpenItem={handleOpenItem}
          topLeftChildren={
            <button
              onClick={() => router.push("/recipe")}
              className="flex h-11 cursor-pointer items-center rounded-md border border-gray-300 bg-medium-gray px-3 py-1 text-sm font-semibold transition hover:bg-gray-100"
            >
              <ArrowLeft className="mr-1 mt-0.5 inline" size={20} /> Back
            </button>
          }
          topRightChildren={
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-medium-gray bg-white text-pepper md:hidden"
              aria-expanded={mobileFiltersOpen}
              aria-label="Open filters"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <Menu className="h-6 w-6" strokeWidth={2} aria-hidden />
            </button>
          }
          userRole={userRole}
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
      </div>

      {mode === "view" ? (
        <ViewRecipePopUp
          open={isOpen}
          onClose={setIsOpen}
          item={selectedItem}
          isComboMode={selectedItemIsCombo}
          changeMode={(nextMode) => setMode(nextMode)}
          userRole={userRole}
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

      {selectedIds.size > 0 && (
        <div className="flex justify-between bg-white border-t border-gray-300 px-6 py-4 shadow-md">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold">Selected:</span>
            {Array.from(selectedIds).map((id) => (
              <button
                key={id}
                onClick={() => toggleSelect(id, selectedNames[id])}
                className="flex items-center text-sm bg-pepper text-white py-1 px-3 rounded-2xl cursor-pointer"
              >
                <CircleX className="mt-px mr-1" size={16} color="#48494b" fill="white" />
                {selectedNames[id]}
              </button>
            ))}
          </div>
          <div className="flex gap-5">
            <button
              className="border border-radish-900 h-8 w-8 rounded-4xl mt-1.5 cursor-pointer"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="ml-1.5" size={18} color="#d8489a" />
            </button>

            <button
              className="flex border bg-radish-900 text-white font-semibold rounded-lg px-4 py-2 cursor-pointer"
              onClick={() => setShowPublishModal(true)}
            >
              Publish <CircleCheck className="ml-1 " size={25} color="#d8489a" fill="white" />
            </button>
          </div>

          {showDeleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
              <div className="relative p-4 w-full max-w-md">
                <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
                  {/* Close button */}
                  <button
                    type="button"
                    className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    ✕
                  </button>

                  {/* Modal content */}
                  <h3 className="text-lg font-semibold text-heading">Delete item?</h3>

                  <p className="text-sm text-body mt-2">This action cannot be undone.</p>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      className="px-4 py-2 rounded-lg text-white bg-dark-gray hover:bg-medium-gray"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 text-white hover:bg-radish-500 bg-radish-900 rounded-lg"
                      onClick={handleDelete}
                      disabled={busy === "delete"}
                    >
                      {busy === "delete" ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPublishModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 rounded-base">
              <div className="relative p-4 w-full max-w-md">
                <div className="bg-white relative bg-neutral-primary-soft rounded-lg shadow-sm p-4 md:p-6">
                  {/* Close button */}
                  <button
                    type="button"
                    className="absolute top-3 right-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 flex items-center justify-center"
                    onClick={() => setShowPublishModal(false)}
                  >
                    ✕
                  </button>

                  {/* Modal content */}
                  <h3 className="text-lg font-semibold text-heading">Publish item?</h3>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      className="px-4 py-2 rounded-lg text-white bg-dark-gray hover:bg-medium-gray"
                      onClick={() => setShowPublishModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="px-4 py-2 text-white hover:bg-radish-500 bg-radish-900 rounded-lg"
                      onClick={handlePublish}
                      disabled={busy === "publish"}
                    >
                      {busy === "publish" ? "Saving..." : "Publish"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
