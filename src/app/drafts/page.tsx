"use client";

import { useRouter } from "next/navigation";
import MealBrowser from "@/components/MealBrowser";
import { CategoryValue, FilterSelections } from "@/lib/types";
import { useState, useEffect } from "react";
import { ArrowLeft, Trash2, CircleX, CircleCheck } from "lucide-react";

// TODO: same for recipes
import { publishCombos, deleteCombos, deleteRecipes, publishRecipes } from "@/app/actions/draftActions";
import { useMealData } from "@/hooks/useMealData";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};

export default function DraftsPage() {
  const router = useRouter();

  // TODO: make recipes also selectable, currently only ComboCard has selection button
  // figma doesn't have styles for selectable RecipeCard
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});
  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryValue>>(new Set());
  const [search, setSearch] = useState("");
  const { items, loading, error, isComboMode, draftCount, refresh } = useMealData({
    search,
    filters: EMPTY_FILTERS,
    selectedCategories,
    draftMode: true,
  });

  useEffect(() => {
    setSelectedIds(new Set());
    setSelectedNames({});
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
  /*
    TODO: style DraftEntryCard (the card that links to the drafts page)
    TODO: figure out what to do about selecting RecipeCards.
    TODO: consider adding min-w and max-w to RecipeCard, allow for responsive grid. Combos are already responsive.
  */

  const handleDelete = async () => {
    if (selectedCategories.has("combo")) {
      await deleteCombos(Array.from(selectedIds));
    } else {
      await deleteRecipes(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    setSelectedNames({});
    refresh();
  };

  const handlePublish = async () => {
    if (selectedCategories.has("combo")) {
      await publishCombos(Array.from(selectedIds));
    } else {
      await publishRecipes(Array.from(selectedIds));
    }
    setSelectedIds(new Set());
    setSelectedNames({});
    refresh();
  };

  return (
    <main className="flex flex-1 flex-col pt-5 overflow-hidden">
      <div className="flex flex-1 px-5 min-h-0">
        <MealBrowser
          setSearch={setSearch}
          items={items}
          loading={loading}
          error={error}
          isComboMode={isComboMode}
          draftCount={draftCount}
          draftMode={true}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          topLeftChildren={
            <button
              onClick={() => router.push("/recipe")}
              className="flex items-center h-11 rounded-md bg-medium-gray border border-gray-300 px-3 py-1 text-sm font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              <ArrowLeft className="inline mt-0.5 mr-1" size={20} /> Back
            </button>
          }
        />
      </div>

      {/*TODO: Style buttons and whatnot */}
      {/*TODO: separate into a component that takes the buttons as props. Permissions page also uses this */}
      {/*TODO: refresh the page after a button click? or figure out a better way */}
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
              onClick={handleDelete}
            >
              <Trash2 className="ml-1.5" size={18} color="#d8489a" />
            </button>

            <button
              className="flex border bg-radish-900 text-white font-semibold rounded-lg px-4 py-2 cursor-pointer"
              onClick={handlePublish}
            >
              Publish <CircleCheck className="ml-1 " size={25} color="#d8489a" fill="white" />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
