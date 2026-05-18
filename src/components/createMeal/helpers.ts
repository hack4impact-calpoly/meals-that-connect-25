import {
  FILTER_SECTIONS,
  type Combo,
  type FilterOption,
  type FilterOptionId,
  type FilterSectionId,
  type Recipe,
  type RecipeMinimal,
} from "@/lib/types";
import { EditableItem } from "../CreateRecipePopUp";

export function isRecipeItem(item: EditableItem): item is Recipe {
  return "category" in item;
}
export function toRecipeMinimal(recipes: Recipe[] = []): RecipeMinimal[] {
  return recipes.map((recipe) => ({
    _id: recipe._id,
    name: recipe.name,
  }));
}
export function comboHasRecipe(combo: Combo, recipeId: string) {
  return (
    combo.entrees?.includes(recipeId) ||
    combo.vegetables?.includes(recipeId) ||
    combo.fruits?.includes(recipeId) ||
    combo.grains?.includes(recipeId)
  );
}
export function toggleFilterOption(selectedOptions: FilterOption[], option: FilterOption): FilterOption[] {
  // check the current toggle status for this option
  const alreadySelected = selectedOptions.some((selectedOption) => selectedOption.id === option.id);

  if (alreadySelected) {
    // toggle off
    return selectedOptions.filter((selectedOption) => selectedOption.id !== option.id);
  }

  // toggle on
  return [...selectedOptions, option];
}
export function optionsToBooleanFlags<TFilterKey extends FilterOptionId>(
  keys: readonly TFilterKey[],
  selectedOptions: FilterOption[],
): Record<TFilterKey, boolean> {
  const selectedIds = new Set(selectedOptions.map((option) => option.id));
  return Object.fromEntries(keys.map((key) => [key, selectedIds.has(key)])) as Record<TFilterKey, boolean>;
}
export function flagsToSelectedOptions<TFilterKey extends FilterOptionId>(
  flags: Partial<Record<TFilterKey, boolean>> | undefined,
  options: FilterOption[],
): FilterOption[] {
  if (!flags) return [];

  return options.filter((option) => flags[option.id as TFilterKey]);
}
export function getFilterSectionOptions(sectionId: FilterSectionId): FilterOption[] {
  const section = FILTER_SECTIONS.find((section) => section.id === sectionId);
  return section?.options ?? [];
}
