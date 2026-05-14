import { Nutrition } from "./types";

export const EMPTY_NUTRITION: Nutrition = {
  calories: 0,
  protein: 0,
  fat: 0,
  carbs: 0,
  fiber: 0,
  sodium: 0,
};

export const WEEKLY_NUTRITION_QUOTA: Nutrition = {
  calories: 3000,
  protein: 75,
  fat: 100,
  carbs: 350,
  fiber: 40,
  sodium: 3200,
};

export const DAILY_NUTRITION_QUOTA: Nutrition = {
  calories: WEEKLY_NUTRITION_QUOTA.calories / 5,
  protein: WEEKLY_NUTRITION_QUOTA.protein / 5,
  fat: WEEKLY_NUTRITION_QUOTA.fat / 5,
  carbs: WEEKLY_NUTRITION_QUOTA.carbs / 5,
  fiber: WEEKLY_NUTRITION_QUOTA.fiber / 5,
  sodium: WEEKLY_NUTRITION_QUOTA.sodium / 5,
};

export const QUOTA_KEYS: Array<keyof Pick<Nutrition, "calories" | "protein" | "sodium">> = [
  "calories",
  "protein",
  "sodium",
];

export type NutritionSummary = {
  _id: string;
  nutritional_info: Nutrition;
  quotaMet: boolean;
};

export function emptyNutrition(): Nutrition {
  return { ...EMPTY_NUTRITION };
}

export function normalizeNutrition(nutrition?: Partial<Nutrition> | null): Nutrition {
  return {
    calories: Number(nutrition?.calories) || 0,
    protein: Number(nutrition?.protein) || 0,
    fat: Number(nutrition?.fat) || 0,
    carbs: Number(nutrition?.carbs) || 0,
    fiber: Number(nutrition?.fiber) || 0,
    sodium: Number(nutrition?.sodium) || 0,
  };
}

export function sumNutrition(items: Array<Partial<Nutrition> | null | undefined>): Nutrition {
  return items.reduce<Nutrition>((total, item) => {
    const next = normalizeNutrition(item);

    return {
      calories: total.calories + next.calories,
      protein: total.protein + next.protein,
      fat: total.fat + next.fat,
      carbs: total.carbs + next.carbs,
      fiber: total.fiber + next.fiber,
      sodium: total.sodium + next.sodium,
    };
  }, emptyNutrition());
}

export function isNutritionQuotaMet(
  nutrition: Partial<Nutrition>,
  quota: Pick<Nutrition, "calories" | "protein" | "sodium"> = DAILY_NUTRITION_QUOTA,
) {
  const normalized = normalizeNutrition(nutrition);

  return QUOTA_KEYS.every((key) => normalized[key] >= quota[key]);
}
