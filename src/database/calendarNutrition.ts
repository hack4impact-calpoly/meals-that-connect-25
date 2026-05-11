import Calendar from "./CalendarSchema";
import Combo from "./ComboSchema";
import Recipe from "./RecipeSchema";
import { Nutrition } from "@/lib/types";
import {
  NutritionSummary,
  emptyNutrition,
  isNutritionQuotaMet,
  normalizeNutrition,
  sumNutrition,
} from "@/lib/nutrition";

type CalendarDoc = {
  _id: string;
  entrees?: string[];
  fruits?: string[];
  sides?: string[];
};

type RecipeDoc = {
  _id: string;
  nutritional_info?: Partial<Nutrition>;
};

type ComboDoc = {
  _id: string;
  entrees?: string[];
  fruits?: string[];
  sides?: string[];
  nutritional_info?: Partial<Nutrition>;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getCalendarIds(day?: CalendarDoc | null) {
  if (!day) return [];
  return [...(day.entrees ?? []), ...(day.fruits ?? []), ...(day.sides ?? [])];
}

function getComboRecipeIds(combo?: ComboDoc | null) {
  if (!combo) return [];
  return [...(combo.entrees ?? []), ...(combo.fruits ?? []), ...(combo.sides ?? [])];
}

export async function getCalendarNutritionSummaries(dateIds: string[]): Promise<NutritionSummary[]> {
  const ids = unique(dateIds);

  if (ids.length === 0) return [];

  const calendarDays = (await Calendar.find({ _id: { $in: ids } })
    .lean()
    .exec()) as CalendarDoc[];
  const dayById = new Map(calendarDays.map((day) => [day._id, day]));
  const calendarItemIds = unique(calendarDays.flatMap(getCalendarIds));

  const combos = calendarItemIds.length
    ? ((await Combo.find({ _id: { $in: calendarItemIds } })
        .lean()
        .exec()) as ComboDoc[])
    : [];
  const comboById = new Map(combos.map((combo) => [combo._id, combo]));
  const comboRecipeIds = unique(combos.flatMap(getComboRecipeIds));

  const recipes =
    calendarItemIds.length || comboRecipeIds.length
      ? ((await Recipe.find({ _id: { $in: unique([...calendarItemIds, ...comboRecipeIds]) } })
          .lean()
          .exec()) as RecipeDoc[])
      : [];
  const recipeById = new Map(recipes.map((recipe) => [recipe._id, recipe]));

  const getItemNutrition = (itemId: string): Nutrition => {
    const recipe = recipeById.get(itemId);
    if (recipe) return normalizeNutrition(recipe.nutritional_info);

    const combo = comboById.get(itemId);
    if (combo) {
      const comboRecipeNutrition = getComboRecipeIds(combo).map(
        (recipeId) => recipeById.get(recipeId)?.nutritional_info,
      );
      return comboRecipeNutrition.length
        ? sumNutrition(comboRecipeNutrition)
        : normalizeNutrition(combo.nutritional_info);
    }

    return emptyNutrition();
  };

  return ids.map((dateId) => {
    const total = sumNutrition(getCalendarIds(dayById.get(dateId)).map(getItemNutrition));

    return {
      _id: dateId,
      nutritional_info: total,
      quotaMet: isNutritionQuotaMet(total),
    };
  });
}
