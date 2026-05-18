import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import {
  DIETARY_KEYS,
  ENTREE_ICON,
  EXCLUSION_KEYS,
  FILTER_SECTIONS,
  FRUIT_ICON,
  GRAIN_ICON,
  NUTRIENT_LABELS,
  RECIPE_BUCKETS,
  TAG_STYLES,
  VEGETABLE_ICON,
} from "@/lib/types";
import type {
  Combo,
  CategoryValue,
  FilterOptionId,
  MealFilterFields,
  Nutrition,
  Recipe,
  RecipeBuckets,
  RecipeCategory,
  SubrecipeIngredient,
} from "@/lib/types";
import { ArrowLeft, Maximize2, Pencil, Tag, CircleAlert, SquarePen, Minus, Plus, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import NutritionalInfo from "./NutrionalInfo";

type Props = {
  open: boolean;
  onClose: (v: boolean) => void;
  item: Recipe | Combo<Recipe> | null;
  isComboMode: boolean;
  changeMode: (mode: "view" | "edit") => void;
  userRole: string | null;
};

function emptyNutrition(): Nutrition {
  return {
    calories: 0,
    protein: 0,
    fatPercentage: 0,
    saturatedFatPercentage: 0,
    fiber: 0,
    calcium: 0,
    magnesium: 0,
    potassium: 0,
    sodium: 0,
    vitaminA: 0,
    vitaminD: 0,
    vitaminC: 0,
    vitaminB12: 0,
  };
}

function scaleNutrition(nutrition: Nutrition, multiplier: number): Nutrition {
  return {
    calories: (nutrition.calories || 0) * multiplier,
    protein: (nutrition.protein || 0) * multiplier,
    fatPercentage: (nutrition.fatPercentage || 0) * multiplier,
    saturatedFatPercentage: (nutrition.saturatedFatPercentage || 0) * multiplier,
    fiber: (nutrition.fiber || 0) * multiplier,
    calcium: (nutrition.calcium || 0) * multiplier,
    magnesium: (nutrition.magnesium || 0) * multiplier,
    potassium: (nutrition.potassium || 0) * multiplier,
    sodium: (nutrition.sodium || 0) * multiplier,
    vitaminA: (nutrition.vitaminA || 0) * multiplier,
    vitaminD: (nutrition.vitaminD || 0) * multiplier,
    vitaminC: (nutrition.vitaminC || 0) * multiplier,
    vitaminB12: (nutrition.vitaminB12 || 0) * multiplier,
  };
}

function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    fatPercentage: a.fatPercentage + b.fatPercentage,
    saturatedFatPercentage: a.saturatedFatPercentage + b.saturatedFatPercentage,
    fiber: a.fiber + b.fiber,
    calcium: a.calcium + b.calcium,
    magnesium: a.magnesium + b.magnesium,
    potassium: a.potassium + b.potassium,
    sodium: a.sodium + b.sodium,
    vitaminA: a.vitaminA + b.vitaminA,
    vitaminD: a.vitaminD + b.vitaminD,
    vitaminC: a.vitaminC + b.vitaminC,
    vitaminB12: a.vitaminB12 + b.vitaminB12,
  };
}

function formatNutritionValue(value: number, originalServings: number, servings: number) {
  const scaled = (value / Math.max(1, originalServings)) * servings;
  return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
}

function getComboNutrition(comboRecipes: RecipeBuckets<Recipe>, comboServing: number): Nutrition {
  const allRecipes = RECIPE_BUCKETS.flatMap((bucket) => comboRecipes[bucket] ?? []);

  const nutritionPerServing = allRecipes.reduce((total, recipe) => {
    const recipeServing = Math.max(1, recipe.serving || 1);
    const recipeNutrition = recipe.nutritional_info ?? emptyNutrition();

    return addNutrition(total, scaleNutrition(recipeNutrition, 1 / recipeServing));
  }, emptyNutrition());

  return scaleNutrition(nutritionPerServing, Math.max(1, comboServing));
}

const FILTER_LABEL_BY_ID = new Map(
  FILTER_SECTIONS.flatMap((section) => section.options.map((option) => [option.id, option.label] as const)),
);

function getFilterLabel(id: FilterOptionId): string {
  return FILTER_LABEL_BY_ID.get(id) ?? id;
}

function selectedFlagLabels<TId extends FilterOptionId>(flags: Record<TId, boolean>, keys: readonly TId[]): string[] {
  return keys.filter((key) => flags[key]).map(getFilterLabel);
}

export default function ViewRecipePopUp({ open, onClose, item, isComboMode, changeMode, userRole }: Props) {
  const [maximized, setMaximized] = useState(false);
  const [servings, setServings] = useState(item?.serving || 1);

  useEffect(() => {
    if (open && item?.serving) {
      setServings(item.serving);
    }
  }, [open, item]);

  if (!item) return null;

  const originalServings = item.serving || 1;

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />

      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            className={`rounded-lg bg-white p-6 shadow-lg transition-all duration-300 ${
              maximized
                ? "fixed inset-0 z-50 h-screen w-screen max-w-none overflow-y-auto rounded-none"
                : "max-h-[90vh] w-full max-w-3xl overflow-y-auto"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ArrowLeft
                  className={`cursor-pointer ${maximized ? "" : "hidden"}`}
                  onClick={() => setMaximized((m) => !m)}
                />
                <Maximize2
                  className={`-scale-y-100 transform cursor-pointer ${maximized ? "hidden" : ""}`}
                  onClick={() => setMaximized((m) => !m)}
                />
              </div>

              <div className="flex flex-row gap-4">
                {(userRole === "Admin" || userRole === "Kitchen Staff") && (
                  <Pencil className="cursor-pointer" onClick={() => changeMode("edit")} />
                )}
              </div>
            </div>

            <div className="relative h-50 w-full overflow-hidden rounded-lg bg-medium-gray">
              {item.imageUrl && (
                <div className="relative mb-4 h-64 w-full">
                  <Image src={item.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
            </div>

            <div className="mb-4 mt-5 text-2xl font-bold">{item.name}</div>

            {isComboMode ? (
              <ComboDetails
                combo={item as Combo<Recipe>}
                servings={servings}
                setServings={setServings}
                originalServings={originalServings}
                userRole={userRole}
              />
            ) : (
              <RecipeDetails
                recipe={item as Recipe}
                servings={servings}
                setServings={setServings}
                originalServings={originalServings}
                userRole={userRole}
              />
            )}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}

function RecipeDetails({
  recipe,
  servings,
  setServings,
  originalServings,
  userRole,
}: {
  recipe: Recipe;
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  originalServings: number;
  userRole: string | null;
}) {
  const nutrition = recipe.nutritional_info ?? emptyNutrition();

  return (
    <>
      <LabeledSection label="Category" icon={<Tag />}>
        <Chip label={recipe.category} styleKey={recipe.category} />
        {recipe.isSubrecipe ? <Chip label="Subrecipe" /> : null}
      </LabeledSection>

      <MealFiltersSection item={recipe} />

      {recipe.notes ? (
        <LabeledSection label="Notes" icon={<SquarePen />}>
          <p>{recipe.notes}</p>
        </LabeledSection>
      ) : null}

      {userRole && (
        <>
          <Divider />

          <ServingsControl servings={servings} setServings={setServings} />
        </>
      )}

      {userRole && (recipe.ingredients?.length || recipe.subrecipes?.length) ? (
        <>
          <Divider />

          {recipe.ingredients?.length ? (
            <div className="mb-4">
              <h3 className="mb-4 text-xl font-semibold">Ingredients</h3>

              <ul className="list-disc pl-5">
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i}>
                    {ingredient.name}: {(ingredient.quantity / originalServings) * servings} {ingredient.units}
                    {ingredient.notes ? (
                      <span className="ml-2 text-pepper/60 text-sm">— {ingredient.notes}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {recipe.subrecipes?.length ? <SubrecipeSection subrecipes={recipe.subrecipes} /> : null}
        </>
      ) : null}

      {userRole && recipe.instructions ? <InstructionsSection instructions={recipe.instructions} /> : null}

      <NutritionSection nutrition={nutrition} servings={servings} originalServings={originalServings} />
    </>
  );
}

function ComboDetails({
  combo,
  servings,
  setServings,
  originalServings,
  userRole,
}: {
  combo: Combo<Recipe>;
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  originalServings: number;
  userRole: string | null;
}) {
  const nutrition = useMemo(() => getComboNutrition(combo, combo.serving), [combo]);

  return (
    <>
      <RecipeGroup label="Entrees" icon={<ENTREE_ICON />} items={combo.entrees} styleKey="Entree" />
      <RecipeGroup label="Vegetables" icon={<VEGETABLE_ICON />} items={combo.vegetables} styleKey="Vegetable" />
      <RecipeGroup label="Fruits" icon={<FRUIT_ICON />} items={combo.fruits} styleKey="Fruit" />
      <RecipeGroup label="Grains" icon={<GRAIN_ICON />} items={combo.grains} styleKey="Grain" />

      <MealFiltersSection item={combo} />

      {combo.notes ? (
        <LabeledSection label="Notes" icon={<SquarePen />}>
          <p>{combo.notes}</p>
        </LabeledSection>
      ) : null}

      {userRole && (
        <>
          <Divider />

          <ServingsControl servings={servings} setServings={setServings} />
        </>
      )}

      {userRole && combo.instructions ? <InstructionsSection instructions={combo.instructions} /> : null}

      <NutritionSection nutrition={nutrition} servings={servings} originalServings={originalServings} />
    </>
  );
}

function mergeSubrecipes(subrecipes: SubrecipeIngredient[]): SubrecipeIngredient[] {
  const merged = new Map<string, SubrecipeIngredient>();
  for (const sr of subrecipes) {
    const existing = merged.get(sr.recipeId);
    if (existing) {
      existing.quantity += sr.quantity;
    } else {
      merged.set(sr.recipeId, { ...sr });
    }
  }
  return Array.from(merged.values());
}

function SubrecipeSection({ subrecipes }: { subrecipes: SubrecipeIngredient[] }) {
  const merged = mergeSubrecipes(subrecipes);

  const CATEGORY_CONFIG: { key: RecipeCategory; label: string; icon: ReactNode }[] = [
    { key: "Entree", label: "Entrees", icon: <ENTREE_ICON /> },
    { key: "Vegetable", label: "Vegetables", icon: <VEGETABLE_ICON /> },
    { key: "Fruit", label: "Fruits", icon: <FRUIT_ICON /> },
    { key: "Grain", label: "Grains", icon: <GRAIN_ICON /> },
  ];

  const uncategorized = merged.filter((sr) => !sr.category);
  const hasAnyCategory = merged.some((sr) => sr.category);

  return (
    <>
      {hasAnyCategory &&
        CATEGORY_CONFIG.map(({ key, label, icon }) => {
          const items = merged.filter((sr) => sr.category === key);
          if (!items.length) return null;
          return (
            <LabeledSection key={key} label={label} icon={icon}>
              <div className="flex flex-wrap gap-2">
                {items.map((sr, i) => (
                  <div key={i} className={`flex items-center gap-1 rounded-md px-2 py-1 ${TAG_STYLES[key]}`}>
                    {sr.recipeName || sr.recipeId}
                    <span className="text-xs opacity-70 ml-1">×{sr.quantity}</span>
                    <button
                      type="button"
                      onClick={() => window.open(`/recipe?id=${sr.recipeId}`)}
                      className="cursor-pointer rounded p-1 hover:opacity-80"
                      aria-label={`Open ${sr.recipeName}`}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </LabeledSection>
          );
        })}

      {uncategorized.length > 0 && (
        <LabeledSection label="Sub-recipes" icon={<Tag />}>
          <div className="flex flex-wrap gap-2">
            {uncategorized.map((sr, i) => (
              <div key={i} className="flex items-center gap-1 rounded-md px-2 py-1 bg-pepper text-white">
                {sr.recipeName || sr.recipeId}
                <span className="text-xs opacity-70 ml-1">×{sr.quantity}</span>
                <button
                  type="button"
                  onClick={() => window.open(`/recipe?id=${sr.recipeId}`)}
                  className="cursor-pointer rounded p-1 hover:opacity-80"
                  aria-label={`Open ${sr.recipeName}`}
                >
                  <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </LabeledSection>
      )}
    </>
  );
}

function RecipeGroup({
  label,
  icon,
  items,
  styleKey,
}: {
  label: string;
  icon: ReactNode;
  items: Recipe[];
  styleKey: RecipeCategory;
}) {
  if (!items.length) return null;

  return (
    <LabeledSection label={label} icon={icon}>
      <div className="flex flex-wrap gap-2">
        {items.map((recipe) => (
          <div key={recipe._id} className={`flex items-center gap-1 rounded-md px-2 py-1 ${TAG_STYLES[styleKey]}`}>
            {recipe.name}

            <button
              type="button"
              onClick={() => window.open(`/recipe?id=${recipe._id}`)}
              className="cursor-pointer rounded p-1 hover:opacity-80"
              aria-label={`Open ${recipe.name}`}
            >
              <ArrowUpRight size={20} />
            </button>
          </div>
        ))}
      </div>
    </LabeledSection>
  );
}

function MealFiltersSection({ item }: { item: MealFilterFields }) {
  const proteinSourceLabels = item.proteinSources.map(getFilterLabel);
  const dietaryLabels = selectedFlagLabels(item.dietary, DIETARY_KEYS);
  const exclusionLabels = selectedFlagLabels(item.exclusions, EXCLUSION_KEYS);

  return (
    <>
      <TagListSection label="Protein Sources" icon={<Tag />} items={proteinSourceLabels} />
      <TagListSection label="Dietary" icon={<Tag />} items={dietaryLabels} />
      <TagListSection label="Exclusions" icon={<CircleAlert />} items={exclusionLabels} />
    </>
  );
}

function TagListSection({ label, icon, items }: { label: string; icon: ReactNode; items?: string[] }) {
  if (!items?.length) return null;

  return (
    <LabeledSection label={label} icon={icon}>
      <div className="flex max-w-full flex-wrap gap-2">
        {items.map((item, i) => (
          <Chip key={`${item}-${i}`} label={item} />
        ))}
      </div>
    </LabeledSection>
  );
}

function LabeledSection({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-4 flex">
      <h3 className="flex w-42 shrink-0 gap-2 py-1 text-nowrap font-bold">
        {icon}
        {label}
      </h3>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ label, styleKey }: { label: string; styleKey?: CategoryValue }) {
  return (
    <div
      className={`whitespace-nowrap rounded-md px-2 py-1 ${styleKey ? TAG_STYLES[styleKey] : "bg-pepper text-white"}`}
    >
      {label}
    </div>
  );
}

function Divider() {
  return <div className="my-8 hidden h-px w-full bg-medium-gray md:block" />;
}

function ServingsControl({
  servings,
  setServings,
}: {
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <>
      <h3 className="mb-4 text-xl font-semibold">Servings</h3>

      <div className="flex w-min items-center rounded-md border border-gray-600">
        <button
          type="button"
          className="rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
          onClick={() => setServings((s) => Math.max(1, s - 1))}
        >
          <Minus />
        </button>

        <span className="w-15 text-center font-mono">{servings}</span>

        <button
          type="button"
          className="rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
          onClick={() => setServings((s) => s + 1)}
        >
          <Plus />
        </button>
      </div>
    </>
  );
}

function InstructionsSection({ instructions }: { instructions: string }) {
  return (
    <>
      <Divider />

      <div className="mb-4">
        <h3 className="mb-4 text-xl font-semibold">Instructions</h3>
        <p className="whitespace-pre-wrap">{instructions}</p>
      </div>
    </>
  );
}

function NutritionSection({
  nutrition,
  servings,
  originalServings,
}: {
  nutrition: Nutrition;
  servings: number;
  originalServings: number;
}) {
  return (
    <>
      <Divider />

      <h3 className="mb-4 text-xl font-semibold">Nutritional Information</h3>

      <div className="mt-3 flex flex-wrap gap-3">
        {NUTRIENT_LABELS.map(({ key, label, unit }) => (
          <NutritionalInfo
            key={key}
            label={label}
            unit={unit}
            value={formatNutritionValue(nutrition[key] ?? 0, originalServings, servings)}
            onChange={() => {}}
            readOnly={true}
          />
        ))}
      </div>
    </>
  );
}
