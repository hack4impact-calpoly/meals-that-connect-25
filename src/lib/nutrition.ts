import { Nutrition } from "./types";

export const EMPTY_NUTRITION: Nutrition = {
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

export const WEEKLY_NUTRITION_QUOTA: Nutrition = {
  calories: 3000,
  protein: 75,
  fatPercentage: 137.5,
  saturatedFatPercentage: 50,
  fiber: 35,
  calcium: 2000,
  magnesium: 525,
  potassium: 4300,
  sodium: 3800,
  vitaminA: 1165,
  vitaminD: 1000,
  vitaminC: 125,
  vitaminB12: 4,
};

export const DAILY_NUTRITION_QUOTA: Nutrition = {
  calories: WEEKLY_NUTRITION_QUOTA.calories / 5,
  protein: WEEKLY_NUTRITION_QUOTA.protein / 5,
  fatPercentage: WEEKLY_NUTRITION_QUOTA.fatPercentage / 5,
  saturatedFatPercentage: WEEKLY_NUTRITION_QUOTA.saturatedFatPercentage / 5,
  fiber: WEEKLY_NUTRITION_QUOTA.fiber / 5,
  calcium: WEEKLY_NUTRITION_QUOTA.calcium / 5,
  magnesium: WEEKLY_NUTRITION_QUOTA.magnesium / 5,
  potassium: WEEKLY_NUTRITION_QUOTA.potassium / 5,
  sodium: WEEKLY_NUTRITION_QUOTA.sodium / 5,
  vitaminA: WEEKLY_NUTRITION_QUOTA.vitaminA / 5,
  vitaminD: WEEKLY_NUTRITION_QUOTA.vitaminD / 5,
  vitaminC: WEEKLY_NUTRITION_QUOTA.vitaminC / 5,
  vitaminB12: WEEKLY_NUTRITION_QUOTA.vitaminB12 / 5,
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
    fatPercentage: Number(nutrition?.fatPercentage) || 0,
    saturatedFatPercentage: Number(nutrition?.saturatedFatPercentage) || 0,
    fiber: Number(nutrition?.fiber) || 0,
    calcium: Number(nutrition?.calcium) || 0,
    magnesium: Number(nutrition?.magnesium) || 0,
    potassium: Number(nutrition?.potassium) || 0,
    sodium: Number(nutrition?.sodium) || 0,
    vitaminA: Number(nutrition?.vitaminA) || 0,
    vitaminD: Number(nutrition?.vitaminD) || 0,
    vitaminC: Number(nutrition?.vitaminC) || 0,
    vitaminB12: Number(nutrition?.vitaminB12) || 0,
  };
}

export function sumNutrition(items: Array<Partial<Nutrition> | null | undefined>): Nutrition {
  return items.reduce<Nutrition>((total, item) => {
    const next = normalizeNutrition(item);

    return {
      calories: total.calories + next.calories,
      protein: total.protein + next.protein,
      fatPercentage: total.fatPercentage + next.fatPercentage,
      saturatedFatPercentage: total.saturatedFatPercentage + next.saturatedFatPercentage,
      fiber: total.fiber + next.fiber,
      calcium: total.calcium + next.calcium,
      magnesium: total.magnesium + next.magnesium,
      potassium: total.potassium + next.potassium,
      sodium: total.sodium + next.sodium,
      vitaminA: total.vitaminA + next.vitaminA,
      vitaminD: total.vitaminD + next.vitaminD,
      vitaminC: total.vitaminC + next.vitaminC,
      vitaminB12: total.vitaminB12 + next.vitaminB12,
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
