import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { TAG_STYLES } from "@/lib/types";
import type { Combo, MealCategory, Nutrition, Recipe, RecipeCategory } from "@/lib/types";
import {
  ArrowLeft,
  Maximize2,
  Pencil,
  Ellipsis,
  Carrot,
  Apple,
  Tag,
  CircleAlert,
  SquarePen,
  Minus,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import NutritionalInfo from "./NutrionalInfo";

type Props = {
  open: boolean;
  onClose: (v: boolean) => void;
  item: Recipe | Combo | null;
  isComboMode: boolean;
  changeMode: (mode: "view" | "edit") => void;
};

type ComboRecipeMap = {
  entrees: Recipe[];
  vegetables: Recipe[];
  fruits: Recipe[];
  grains: Recipe[];
};

const EMPTY_COMBO_RECIPE_MAP: ComboRecipeMap = {
  entrees: [],
  vegetables: [],
  fruits: [],
  grains: [],
};

function emptyNutrition(): Nutrition {
  return {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sodium: 0,
  };
}

function scaleNutrition(nutrition: Nutrition, multiplier: number): Nutrition {
  return {
    calories: (nutrition.calories || 0) * multiplier,
    protein: (nutrition.protein || 0) * multiplier,
    fat: (nutrition.fat || 0) * multiplier,
    carbs: (nutrition.carbs || 0) * multiplier,
    fiber: (nutrition.fiber || 0) * multiplier,
    sodium: (nutrition.sodium || 0) * multiplier,
  };
}

function addNutrition(a: Nutrition, b: Nutrition): Nutrition {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    fat: a.fat + b.fat,
    carbs: a.carbs + b.carbs,
    fiber: a.fiber + b.fiber,
    sodium: a.sodium + b.sodium,
  };
}

function formatNutritionValue(value: number, originalServings: number, servings: number) {
  const scaled = (value / Math.max(1, originalServings)) * servings;
  return Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1);
}

async function getRecipe(id: string, signal?: AbortSignal): Promise<Recipe> {
  const res = await fetch(`/api/recipes/${id}`, { signal });

  if (!res.ok) {
    throw new Error(`Failed to get individual recipe (${res.status})`);
  }

  return res.json();
}

async function getRecipes(ids: string[] = [], signal?: AbortSignal): Promise<Recipe[]> {
  return Promise.all(ids.map((id) => getRecipe(id, signal)));
}

function getComboNutrition(comboRecipes: ComboRecipeMap, comboServing: number): Nutrition {
  const allRecipes = [
    ...comboRecipes.entrees,
    ...comboRecipes.vegetables,
    ...comboRecipes.fruits,
    ...comboRecipes.grains,
  ];

  const nutritionPerServing = allRecipes.reduce((total, recipe) => {
    const recipeServing = Math.max(1, recipe.serving || 1);
    const recipeNutrition = recipe.nutritional_info ?? emptyNutrition();

    return addNutrition(total, scaleNutrition(recipeNutrition, 1 / recipeServing));
  }, emptyNutrition());

  return scaleNutrition(nutritionPerServing, Math.max(1, comboServing));
}

export default function ViewRecipePopUp({ open, onClose, item, isComboMode, changeMode }: Props) {
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
                <Pencil className="cursor-pointer" onClick={() => changeMode("edit")} />
                <Ellipsis className="cursor-pointer" />
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
                combo={item as Combo}
                servings={servings}
                setServings={setServings}
                originalServings={originalServings}
              />
            ) : (
              <RecipeDetails
                recipe={item as Recipe}
                servings={servings}
                setServings={setServings}
                originalServings={originalServings}
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
}: {
  recipe: Recipe;
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  originalServings: number;
}) {
  const nutrition = recipe.nutritional_info ?? emptyNutrition();

  return (
    <>
      <LabeledSection label="Category" icon={<Tag />}>
        <Chip label={recipe.category} styleKey={recipe.category} />
        {recipe.isSubrecipe ? <Chip label="Subrecipe" /> : null}
      </LabeledSection>

      <TagListSection label="Filters" icon={<Tag />} items={recipe.filters} />
      <TagListSection label="Allergens" icon={<CircleAlert />} items={recipe.allergens} />

      {recipe.notes ? (
        <LabeledSection label="Notes" icon={<SquarePen />}>
          <p>{recipe.notes}</p>
        </LabeledSection>
      ) : null}

      <Divider />

      <ServingsControl servings={servings} setServings={setServings} />

      {recipe.ingredients?.length ? (
        <>
          <Divider />

          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold">Ingredients</h3>

            <ul className="list-disc pl-5">
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>
                  {ingredient.name}: {(ingredient.quantity / originalServings) * servings} {ingredient.units}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {recipe.instructions ? <InstructionsSection instructions={recipe.instructions} /> : null}

      <NutritionSection nutrition={nutrition} servings={servings} originalServings={originalServings} />
    </>
  );
}

function ComboDetails({
  combo,
  servings,
  setServings,
  originalServings,
}: {
  combo: Combo;
  servings: number;
  setServings: React.Dispatch<React.SetStateAction<number>>;
  originalServings: number;
}) {
  const [comboRecipes, setComboRecipes] = useState<ComboRecipeMap>(EMPTY_COMBO_RECIPE_MAP);

  const nutrition = useMemo(() => getComboNutrition(comboRecipes, combo.serving), [comboRecipes, combo.serving]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadComboRecipes() {
      try {
        setComboRecipes(EMPTY_COMBO_RECIPE_MAP);

        const [entrees, vegetables, fruits, grains] = await Promise.all([
          getRecipes(combo.entrees, controller.signal),
          getRecipes(combo.vegetables, controller.signal),
          getRecipes(combo.fruits, controller.signal),
          getRecipes(combo.grains, controller.signal),
        ]);

        setComboRecipes({
          entrees,
          vegetables,
          fruits,
          grains,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        console.error("Failed to load combo recipes:", err);
        setComboRecipes(EMPTY_COMBO_RECIPE_MAP);
      }
    }

    loadComboRecipes();

    return () => controller.abort();
  }, [combo]);

  return (
    <>
      <RecipeGroup label="Entrees" icon={<Carrot />} items={comboRecipes.entrees} styleKey="Entree" />
      <RecipeGroup label="Vegetables" icon={<Carrot />} items={comboRecipes.vegetables} styleKey="Vegetable" />
      <RecipeGroup label="Fruits" icon={<Apple />} items={comboRecipes.fruits} styleKey="Fruit" />
      <RecipeGroup label="Grains" icon={<Tag />} items={comboRecipes.grains} styleKey="Grain" />

      <TagListSection label="Filters" icon={<Tag />} items={combo.filters} />
      <TagListSection label="Allergens" icon={<CircleAlert />} items={combo.allergens} />

      {combo.notes ? (
        <LabeledSection label="Notes" icon={<SquarePen />}>
          <p>{combo.notes}</p>
        </LabeledSection>
      ) : null}

      <Divider />

      <ServingsControl servings={servings} setServings={setServings} />

      {combo.instructions ? <InstructionsSection instructions={combo.instructions} /> : null}

      <NutritionSection nutrition={nutrition} servings={servings} originalServings={originalServings} />
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
      <h3 className="flex w-30 shrink-0 gap-2 py-1 font-bold">
        {icon}
        {label}
      </h3>

      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ label, styleKey }: { label: string; styleKey?: MealCategory }) {
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
        <NutritionalInfo
          label="Calories"
          unit="kcal"
          value={formatNutritionValue(nutrition.calories, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
        <NutritionalInfo
          label="Protein"
          unit="g"
          value={formatNutritionValue(nutrition.protein, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
        <NutritionalInfo
          label="Fat"
          unit="g"
          value={formatNutritionValue(nutrition.fat, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
        <NutritionalInfo
          label="Carbs"
          unit="g"
          value={formatNutritionValue(nutrition.carbs, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
        <NutritionalInfo
          label="Fiber"
          unit="g"
          value={formatNutritionValue(nutrition.fiber, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
        <NutritionalInfo
          label="Sodium"
          unit="mg"
          value={formatNutritionValue(nutrition.sodium, originalServings, servings)}
          onChange={() => {}}
          readOnly={true}
        />
      </div>
    </>
  );
}
