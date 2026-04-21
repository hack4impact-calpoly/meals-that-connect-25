"use client";

import RecipeCard from "@/components/RecipeCard";
import ComboCard from "@/components/ComboCard";
import DraftEntryCard from "@/components/DraftEntryCard";

import { Recipe, Combo, Subrecipe } from "@/lib/types";

type Props = {
  loading: boolean;
  error: string | null;
  isCombo: boolean;
  isSubrecipe: boolean;
  items: Recipe[] | Combo[] | Subrecipe[];
  draftMode: boolean;
  draftCount: number;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, name: string) => void;
  onOpenItem?: (item: Recipe | Combo | Subrecipe) => void;
};

export default function CardGrid({
  loading,
  error,
  isCombo: isCombo,
  isSubrecipe: isSubrecipe,
  items,
  draftMode,
  draftCount,
  selectedIds,
  onToggleSelect,
  onOpenItem,
}: Props) {
  if (loading) return <div className="text-sm text-black/60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (items.length === 0) return <div className="text-sm text-black/60">No results found.</div>;

  // ---------------- Combo Layout ----------------

  if (isCombo) {
    return (
      <div className="flex flex-wrap gap-6">
        {!draftMode && <DraftEntryCard variant="Combo" numDrafts={draftCount} />}

        {(items as Combo[]).map((combo) => (
          <ComboCard
            item={combo}
            key={combo._id}
            name={combo.name}
            imageUrl={combo.imageUrl}
            entrees={combo.entrees ?? []}
            vegetables={combo.vegetables ?? []}
            grains={combo.grains ?? []}
            fruits={combo.fruits ?? []}
            serving={combo.serving}
            isDraft={combo.isDraft}
            isSelected={selectedIds?.has(combo._id)}
            onSelect={() => onToggleSelect?.(combo._id, combo.name)}
            onOpen={() => onOpenItem?.(combo)}
          />
        ))}
      </div>
    );
  }

  // ---------------- Subrecipe Layout ----------------

  if (isSubrecipe) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {!draftMode && <DraftEntryCard variant="subrecipe" numDrafts={draftCount} />}

        {(items as Subrecipe[]).map((subrecipe) => (
          <RecipeCard
            key={subrecipe._id}
            item={subrecipe}
            name={subrecipe.name}
            imageUrl={""}
            notes={subrecipe.notes ?? ""}
            tags={[]}
            isDraft={subrecipe.isDraft}
            isSelected={selectedIds?.has(subrecipe._id)}
            onSelect={() => onToggleSelect?.(subrecipe._id, subrecipe.name)}
            onOpen={() => onOpenItem?.(subrecipe)}
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
          item={recipe}
          name={recipe.name}
          imageUrl={recipe.imageUrl}
          notes={recipe.notes ?? ""}
          tags={[...(recipe.filters ?? []), ...(recipe.allergens ?? [])]}
          isDraft={recipe.isDraft}
          isSelected={selectedIds?.has(recipe._id)}
          onSelect={() => onToggleSelect?.(recipe._id, recipe.name)}
          onOpen={() => onOpenItem?.(recipe)}
        />
      ))}
    </div>
  );
}
