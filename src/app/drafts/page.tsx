"use client";

import { useRouter } from "next/navigation";
import MealBrowser from "@/components/MealBrowser";
import { FilterSelections } from "@/lib/types";

const EMPTY_FILTERS: FilterSelections = {
  allergens: new Set(),
  proteins: new Set(),
  vitamins: new Set(),
  dietary: new Set(),
  serving: new Set(),
};
/*
TODO: add a selection checkbox to RecipeCard
TODO: consider adding a min-w and max-w to RecipeCard, allow more columns on wide screen
TODO: style the back button and the DraftEntryCard.tsx
*/
export default function DraftsPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col px-5 pt-5 gap-6 overflow-hidden">
      <MealBrowser draftMode={true} filters={EMPTY_FILTERS}>
        <button
          onClick={() => router.push("/recipe")}
          className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 transition"
        >
          ← Back
        </button>
      </MealBrowser>
      {/*TODO: add the footer for displaying selections, publish, delete buttons*/}
    </main>
  );
}
