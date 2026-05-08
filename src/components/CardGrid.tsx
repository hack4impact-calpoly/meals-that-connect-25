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
  onOpenItem?: (item: Recipe | Combo) => void;
  userRole: string | null;
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
  onOpenItem,
  userRole,
}: Props) {
  if (loading) return <div className="text-sm text-black/60">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">{error}</div>;
  if (items.length === 0) return <div className="text-sm text-black/60">No results found.</div>;

  // ---------------- Combo Layout ----------------

  if (isComboMode) {
    return (
      <div className="grid grid-cols-2 gap-3 md:gap-6 md:max-w-3xl">
        {!draftMode && (userRole === "Admin" || userRole === "Kitchen Staff") && (
          <DraftEntryCard variant="Combo" numDrafts={draftCount} />
        )}

        {(items as Combo[]).map((combo) => (
          <ComboCard
            item={combo}
            key={combo._id}
            name={combo.name}
            imageUrl={combo.imageUrl}
            entrees={combo.entrees ?? []}
            sides={combo.sides ?? []}
            fruits={combo.fruits ?? []}
            serving={combo.serving}
            isDraft={combo.isDraft}
            isSelected={selectedIds?.has(combo._id)}
            onSelect={() => onToggleSelect?.(combo._id, combo.name)}
            onOpen={() => onOpenItem?.(combo)}
            userRole={userRole}
          />
        ))}
      </div>
    );
  }

  // ---------------- Recipe Layout ----------------

  return (
    <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2 md:max-w-3xl">
      {!draftMode && (userRole === "Admin" || userRole === "Kitchen Staff") && (
        <DraftEntryCard variant="recipe" numDrafts={draftCount} />
      )}

      {(items as Recipe[]).map((recipe) => (
        <RecipeCard
          key={recipe._id}
          item={recipe}
          name={recipe.name}
          imageUrl={recipe.imageUrl}
          servingSize={recipe.serving.toString()}
          tags={[...(recipe.filters ?? []), ...(recipe.allergens ?? [])]}
          isDraft={recipe.isDraft}
          isSelected={selectedIds?.has(recipe._id)}
          onSelect={() => onToggleSelect?.(recipe._id, recipe.name)}
          onOpen={() => onOpenItem?.(recipe)}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
