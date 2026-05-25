import crypto from "crypto";
import Combo from "@/database/ComboSchema";
import { normalizeNutrition } from "@/lib/nutrition";

// These functions are used for generating mock combos for testing purposes

export async function seedCombos(count: number, overrides: any = {}) {
  const combos = Array.from({ length: count }, () => makeCombo(overrides));
  await Combo.insertMany(combos);
  return combos;
}

export function makeCombo(overrides = {}) {
  return {
    _id: crypto.randomUUID(),
    name: "Test Combo",
    serving: 1,
    entrees: [],
    sides: [],
    fruits: [],
    filters: ["Vegetarian"],
    notes: "Test combo fixture",
    allergens: [],
    instructions: "Serve together.",
    nutritional_info: normalizeNutrition({ calories: 200, protein: 5, fiber: 3 }),
    isDraft: false,
    ...overrides,
  };
}
