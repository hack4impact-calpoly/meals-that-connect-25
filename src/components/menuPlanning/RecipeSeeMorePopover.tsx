"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUpRight, X } from "lucide-react";
import { useState } from "react";
import { CATEGORY_DISPLAY_MAP, EXCLUSION_KEYS, FILTER_SECTIONS, TAG_STYLES, type Recipe } from "@/lib/types";

type RecipeSeeMorePopoverProps = {
  recipeId: string;
  variant?: "compact" | "default";
  userRole: string | null;
};

function formatNutritionValue(value?: number) {
  return value == null ? "0" : value.toString();
}

export default function RecipeSeeMorePopover({ recipeId, variant = "default", userRole }: RecipeSeeMorePopoverProps) {
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      className={`relative shrink-0 ${rowMin}`}
      onMouseEnter={() => {
        setIsOpen(true);
        fetchRecipe();
      }}
      onMouseLeave={() => setIsOpen(false)}
    >
      <>
        <PopoverButton
          type="button"
          className={`inline-flex items-center gap-1 whitespace-nowrap font-montserrat font-semibold underline underline-offset-2 ${textSize}`}
          onFocus={() => {
            setIsOpen(true);
            fetchRecipe();
          }}
          onBlur={() => setIsOpen(false)}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          aria-label="See more recipe details"
        >
          Quick View
          <ArrowUpRight className={`${iconSize} shrink-0`} strokeWidth={2.2} aria-hidden />
        </PopoverButton>

        {isOpen ? (
          <PopoverPanel
            static
            className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-medium-gray bg-white font-montserrat text-pepper shadow-xl"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-medium-gray/60 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <h3 className="truncate text-sm font-bold leading-tight" title={recipe?.name}>
                    {recipe?.name ?? "Recipe"}
                  </h3>

                  {recipe ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold leading-none ${TAG_STYLES[recipe.category]}`}
                      >
                        {CATEGORY_DISPLAY_MAP[recipe.category].label}
                      </span>
                      <span
                        className={`text-[11px] font-medium leading-none text-pepper/60 ${userRole ? "" : "hidden"}`}
                      >
                        {recipe.serving} servings
                      </span>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="rounded-md p-1 text-pepper/50 transition hover:bg-light-gray hover:text-pepper"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close recipe details"
                >
                  <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3">
              {isLoading ? <p className="text-sm font-medium text-pepper/60">Loading recipe...</p> : null}

              {error ? <p className="text-sm font-medium text-radish-900">{error}</p> : null}

              {recipe ? (
                <div className="space-y-3 text-sm">
                  {recipe.exclusions ? (
                    <section className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-pepper/50">Allergens</h4>
                      {EXCLUSION_KEYS.map((key) =>
                        recipe.exclusions?.[key] ? (
                          <p key={key} className="whitespace-pre-wrap leading-snug text-pepper/80">
                            {FILTER_SECTIONS[0].options.find((option) => option.id === key)?.label || key}
                          </p>
                        ) : null,
                      )}
                    </section>
                  ) : null}

                  {userRole && recipe.notes ? (
                    <section className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-pepper/50">Notes</h4>
                      <p className="whitespace-pre-wrap leading-snug text-pepper/80">{recipe.notes}</p>
                    </section>
                  ) : null}

                  {userRole && recipe.ingredients?.length ? (
                    <section className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-pepper/50">Ingredients</h4>
                      <ul className="space-y-1">
                        {recipe.ingredients.map((ingredient, index) => (
                          <li
                            key={`${ingredient.name}-${index}`}
                            className="flex justify-between gap-3 rounded-md bg-light-gray/60 px-2 py-1 text-xs"
                          >
                            <span className="font-semibold text-pepper">{ingredient.name}</span>
                            <span className="shrink-0 text-pepper/70">
                              {ingredient.quantity} {ingredient.units}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {userRole && recipe.instructions ? (
                    <section className="space-y-1.5">
                      <h4 className="text-[11px] font-bold uppercase tracking-wide text-pepper/50">Instructions</h4>
                      <p className="whitespace-pre-wrap leading-snug text-pepper/80">{recipe.instructions}</p>
                    </section>
                  ) : null}

                  <section className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-pepper/50">Nutrition</h4>

                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {[
                        ["Calories", `${formatNutritionValue(recipe.nutritional_info?.calories)} kcal`],
                        ["Protein", `${formatNutritionValue(recipe.nutritional_info?.protein)} g`],
                        ["Fat", `${formatNutritionValue(recipe.nutritional_info?.fat)} g`],
                        ["Carbs", `${formatNutritionValue(recipe.nutritional_info?.carbs)} g`],
                        ["Fiber", `${formatNutritionValue(recipe.nutritional_info?.fiber)} g`],
                        ["Sodium", `${formatNutritionValue(recipe.nutritional_info?.sodium)} mg`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-md bg-light-gray/60 px-2 py-1">
                          <p className="font-semibold leading-tight text-pepper">{label}</p>
                          <p className="leading-tight text-pepper/70">{value}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>

            <div className="border-t border-medium-gray/60 p-3">
              <a
                href={`/recipe?id=${encodeURIComponent(recipeId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1 rounded-md bg-radish-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-radish-800"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                aria-label="See more: open full recipe"
              >
                See More
                <ArrowUpRight className="h-4 w-4 shrink-0" strokeWidth={2.2} aria-hidden />
              </a>
            </div>
          </PopoverPanel>
        ) : null}
      </>
    </Popover>
  );
}
