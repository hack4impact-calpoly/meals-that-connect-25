"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUpRight, X } from "lucide-react";
import { useState } from "react";
import { TAG_STYLES, type Recipe } from "@/lib/types";

type RecipeSeeMorePopoverProps = {
  recipeId: string;
  variant?: "compact" | "default";
};

function formatNutritionValue(value?: number) {
  return value == null ? "0" : value.toString();
}

export default function RecipeSeeMorePopover({ recipeId, variant = "default" }: RecipeSeeMorePopoverProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textSize = variant === "compact" ? "text-[11px]" : "text-xs";
  const iconSize = variant === "compact" ? "h-3 w-3" : "h-3.5 w-3.5";
  const rowMin = variant === "compact" ? "min-h-[1.125rem]" : "min-h-[1.375rem]";

  const fetchRecipe = async () => {
    if (recipe || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`);

      if (!response.ok) {
        throw new Error(`Failed to load recipe (${response.status})`);
      }

      setRecipe(await response.json());
    } catch (err) {
      console.error(err);
      setError("Recipe details could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover className={`relative shrink-0 ${rowMin} pt-0.5`}>
      {({ close }) => (
        <>
          <PopoverButton
            type="button"
            className={`inline-flex items-center gap-0.5 whitespace-nowrap font-montserrat font-semibold underline ${textSize}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              fetchRecipe();
            }}
            aria-label="See more recipe details"
          >
            Quick View
            <ArrowUpRight className={`${iconSize} shrink-0`} strokeWidth={2.2} aria-hidden />
          </PopoverButton>

          <PopoverPanel
            className="absolute top-full left-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-medium-gray bg-white text-pepper shadow-xl"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-medium-gray/60 px-4 py-3">
              <div className="min-w-0">
                <h3 className="truncate font-montserrat text-base font-bold" title={recipe?.name}>
                  {recipe?.name ?? "Recipe"}
                </h3>

                {recipe ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 font-montserrat text-xs font-medium ${TAG_STYLES[recipe.category]}`}
                    >
                      {recipe.category}
                    </span>
                    <span className="font-montserrat text-xs font-medium text-pepper/65">
                      {recipe.serving} servings
                    </span>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="shrink-0 rounded-md p-1 text-pepper/60 hover:bg-light-gray hover:text-pepper"
                onClick={() => close()}
                aria-label="Close recipe details"
              >
                <X className="h-4 w-4" strokeWidth={2} aria-hidden />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto px-4 py-3 font-montserrat text-sm">
              {isLoading ? <p className="text-pepper/65">Loading recipe...</p> : null}
              {error ? <p className="text-radish-900">{error}</p> : null}

              {recipe ? (
                <div className="space-y-4">
                  {recipe.notes ? (
                    <section>
                      <h4 className="mb-1 text-xs font-bold uppercase text-pepper/55">Notes</h4>
                      <p className="whitespace-pre-wrap leading-snug">{recipe.notes}</p>
                    </section>
                  ) : null}

                  {recipe.ingredients?.length ? (
                    <section>
                      <h4 className="mb-1 text-xs font-bold uppercase text-pepper/55">Ingredients</h4>
                      <ul className="list-disc space-y-1 pl-4 leading-snug">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li key={`${ingredient.name}-${index}`}>
                            {ingredient.name}: {ingredient.quantity} {ingredient.units}
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {recipe.instructions ? (
                    <section>
                      <h4 className="mb-1 text-xs font-bold uppercase text-pepper/55">Instructions</h4>
                      <p className="whitespace-pre-wrap leading-snug">{recipe.instructions}</p>
                    </section>
                  ) : null}

                  <section>
                    <h4 className="mb-2 text-xs font-bold uppercase text-pepper/55">Nutrition</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span>Calories: {formatNutritionValue(recipe.nutritional_info?.calories)} kcal</span>
                      <span>Protein: {formatNutritionValue(recipe.nutritional_info?.protein)} g</span>
                      <span>Fat: {formatNutritionValue(recipe.nutritional_info?.fat)} g</span>
                      <span>Carbs: {formatNutritionValue(recipe.nutritional_info?.carbs)} g</span>
                      <span>Fiber: {formatNutritionValue(recipe.nutritional_info?.fiber)} g</span>
                      <span>Sodium: {formatNutritionValue(recipe.nutritional_info?.sodium)} mg</span>
                    </div>
                  </section>
                </div>
              ) : null}
            </div>

            <div className="border-t border-medium-gray/60 px-4 py-3">
              <a
                href={`/recipe?id=${encodeURIComponent(recipeId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-radish-900 px-3 py-2 font-montserrat text-sm font-semibold text-white hover:bg-radish-800"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                aria-label="See more: open full recipe"
              >
                See More
                <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
              </a>
            </div>
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
