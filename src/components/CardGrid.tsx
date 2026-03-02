"use client";

import RecipeCard from "@/components/RecipeCard";
import ComboCard from "@/components/ComboCard";
import DraftEntryCard from "@/components/DraftEntryCard";

import { Recipe, Combo } from "@/lib/types";

type Props = {
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  items: Recipe[] | Combo[];
  draftMode: boolean;
  draftCount: number;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, name: string) => void;
};

export default function CardGrid({
  loading,
  error,
  isComboMode,
  items,
  draftMode,
  draftCount,
  selectedIds,
  onToggleSelect,
}: Props) {
  if (loading) return <div className="text-sm text-black/60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (items.length === 0) return <div className="text-sm text-black/60">No results found.</div>;

  // ---------------- Combo Layout ----------------

  if (isComboMode) {
    return (
      <div className="flex flex-wrap gap-6">
        {!draftMode && <DraftEntryCard variant="combo" numDrafts={draftCount} />}

        {(items as Combo[]).map((combo) => (
          <ComboCard
            key={combo._id}
            name={combo.name}
            imageUrl={combo.imageUrl}
            tags={[]}
            serving={combo.serving}
            isDraft={combo.isDraft}
            isSelected={selectedIds?.has(combo._id)}
            onSelect={() => onToggleSelect?.(combo._id, combo.name)}
          />
        ))}
      </div>
    );
  }

  // ---------------- Recipe Layout ----------------

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {!draftMode && <DraftEntryCard variant="recipe" numDrafts={draftCount} />}

      {(items as Recipe[]).map((recipe) => (
        <RecipeCard
          key={recipe._id}
          name={recipe.name}
          imageUrl={recipe.imageUrl}
          // TODO: Update RecipeCard with correct recipe schema
          servingSize={recipe.serving ? `${recipe.serving}` : undefined}
          tags={recipe.tags ?? []}
          isDraft={recipe.isDraft}
        />
      ))}
    </div>
  );
}
