import Calendar from "./CalendarSchema";
import Combo from "./ComboSchema";
import Recipe from "./RecipeSchema";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { Nutrition, RecipeBuckets } from "@/lib/types";
import {
  NutritionSummary,
  emptyNutrition,
  isNutritionQuotaMet,
  normalizeNutrition,
  sumNutrition,
} from "@/lib/nutrition";

type BucketDoc = {
  _id: string;
} & Partial<RecipeBuckets<string>>;

type RecipeDoc = {
  _id: string;
  nutritional_info?: Partial<Nutrition>;
};

type ComboDoc = BucketDoc & {
  nutritional_info?: Partial<Nutrition>;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getBucketIds(doc?: Partial<RecipeBuckets<string>> | null) {
  if (!doc) return [];

  return RECIPE_BUCKETS.flatMap((bucket) => doc[bucket] ?? []);
}

export async function getCalendarNutritionSummaries(dateIds: string[]): Promise<NutritionSummary[]> {
  const ids = unique(dateIds);

  if (ids.length === 0) return [];

  const calendarDays = (await Calendar.find({ _id: { $in: ids } })
    .lean()
    .exec()) as BucketDoc[];
  const dayById = new Map(calendarDays.map((day) => [day._id, day]));
  const calendarItemIds = unique(calendarDays.flatMap(getBucketIds));

  const combos = calendarItemIds.length
    ? ((await Combo.find({ _id: { $in: calendarItemIds } })
        .select("_id entrees vegetables fruits grains nutritional_info")
        .lean()
        .exec()) as ComboDoc[])
    : [];
  const comboById = new Map(combos.map((combo) => [combo._id, combo]));
  const comboRecipeIds = unique(combos.flatMap(getBucketIds));

  const recipeIds = unique([...calendarItemIds, ...comboRecipeIds]);
  const recipes = recipeIds.length
    ? ((await Recipe.find({ _id: { $in: recipeIds } })
        .select("_id nutritional_info")
        .lean()
        .exec()) as RecipeDoc[])
    : [];
  const recipeById = new Map(recipes.map((recipe) => [recipe._id, recipe]));

  const getItemNutrition = (itemId: string): Nutrition => {
    const recipe = recipeById.get(itemId);
    if (recipe) return normalizeNutrition(recipe.nutritional_info);

    const combo = comboById.get(itemId);
    if (combo?.nutritional_info) return normalizeNutrition(combo.nutritional_info);

    if (combo) {
      return sumNutrition(getBucketIds(combo).map((recipeId) => recipeById.get(recipeId)?.nutritional_info));
    }

    return emptyNutrition();
  };

  return ids.map((dateId) => {
    const total = sumNutrition(getBucketIds(dayById.get(dateId)).map(getItemNutrition));

    return {
      _id: dateId,
      nutritional_info: total,
      quotaMet: isNutritionQuotaMet(total),
    };
  });
}
