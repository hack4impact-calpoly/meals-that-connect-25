"use client";

import { useRouter } from "next/navigation";
import MealBrowser from "@/components/MealBrowser";
import { FilterSelections } from "@/lib/types";
import { useState } from "react";

// TODO: same for recipes
import { publishCombos, deleteCombos } from "@/app/actions/draftActions";

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

  return (
    <main className="flex flex-1 flex-col pt-5 gap-6 overflow-hidden">
      <div className="flex-1 px-5">
        <MealBrowser
          draftMode={true}
          filters={EMPTY_FILTERS}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          topLeftChildren={
            <button
              onClick={() => router.push("/recipe")}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 transition"
            >
              ← Back
            </button>
          }
        />
      </div>

      {/*TODO: Style buttons and whatnot */}
      {/*TODO: separate into a component that takes the buttons as props. Permissions page also uses this */}
      {/*TODO: refresh the page after a button click? or figure out a better way */}
      {selectedIds.size > 0 && (
        <div className="bg-white border-t border-gray-300 px-6 py-4 shadow-md">
          <div className="flex flex-wrap gap-4">
            {Array.from(selectedIds).map((id) => (
              <button key={id} onClick={() => toggleSelect(id, selectedNames[id])} className="text-sm underline">
                {selectedNames[id]}
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              await publishCombos(Array.from(selectedIds));
              setSelectedIds(new Set());
              setSelectedNames({});
            }}
          >
            Publish
          </button>

          <button
            onClick={async () => {
              await deleteCombos(Array.from(selectedIds));
              setSelectedIds(new Set());
              setSelectedNames({});
            }}
          >
            Delete
          </button>
        </div>
      )}
    </main>
  );
}
