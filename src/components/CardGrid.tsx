import RecipeCard from "@/components/RecipeCard";
import ComboCard from "@/components/ComboCard";
import DraftEntryCard from "@/components/DraftEntryCard";

import { Recipe, Combo, RecipePreview } from "@/lib/types";

type Props = {
  loading: boolean;
  error: string | null;
  isComboMode: boolean;
  items: Recipe[] | Combo<RecipePreview>[];
  draftMode: boolean;
  draftCount: number;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string, name: string) => void;
  onOpenItem?: (item: Recipe | Combo<RecipePreview>) => void;
  userRole: string | null;
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
  userRole,
}: Props) {
  if (loading) return <div className="text-sm text-black/60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (items.length === 0) return <div className="text-sm text-black/60">No results found.</div>;

  // ---------------- Combo Layout ----------------

  if (isComboMode) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-full overflow-y-auto">
        {!draftMode && (userRole === "Admin" || userRole === "Kitchen Staff") && (
          <DraftEntryCard variant="Combo" numDrafts={draftCount} />
        )}

        {(items as Combo<RecipePreview>[]).map((combo) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-3 md:gap-4 w-full overflow-hidden">
      {!draftMode && (userRole === "Admin" || userRole === "Kitchen Staff") && (
        <DraftEntryCard variant="recipe" numDrafts={draftCount} />
      )}

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
