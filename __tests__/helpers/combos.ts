import crypto from "crypto";
import Combo from "@/database/ComboSchema";
import { makeIngredient } from "./recipes";

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
    sides: [makeIngredient({ name: "Rice", quantity: "100g" })],
    fruits: [makeIngredient({ name: "Apple", quantity: "1" })],
    filters: ["Vegetarian"],
    notes: "Test combo fixture",
    allergens: [],
    instructions: "Serve together.",
    nutritional_info: [200, 5, 30],
    ...overrides,
  };
}
