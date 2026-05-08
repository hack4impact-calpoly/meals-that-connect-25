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
  onOpenItem?: (item: Recipe | Combo) => void;
};

// FIXME: layouts are currently sortof broken (max 2 cols for some reason). Figure out why
export default function CardGrid({
  loading,
  error,
  isComboMode,
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

  if (isComboMode) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-6 md:max-w-3xl">
        {!draftMode && <DraftEntryCard variant="Combo" numDrafts={draftCount} />}

        {(items as Combo[]).map((combo) => (
          <ComboCard
            key={combo._id}
            item={combo}
            isSelected={selectedIds?.has(combo._id)}
            onSelect={() => onToggleSelect?.(combo._id, combo.name)}
            onOpen={() => onOpenItem?.(combo)}
          />
        ))}
      </div>
    );
  }

  // ---------------- Recipe Layout ----------------

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 md:max-w-3xl">
      {!draftMode && <DraftEntryCard variant="recipe" numDrafts={draftCount} />}

      {(items as Recipe[]).map((recipe) => (
        <RecipeCard
          key={recipe._id}
          item={recipe}
          isSelected={selectedIds?.has(recipe._id)}
          onSelect={() => onToggleSelect?.(recipe._id, recipe.name)}
          onOpen={() => onOpenItem?.(recipe)}
        />
      ))}
    </div>
  );
}
