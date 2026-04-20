import crypto from "crypto";
import Combo from "@/database/ComboSchema";

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
    entrees: [crypto.randomUUID()],
    sides: [crypto.randomUUID()],
    fruits: [crypto.randomUUID()],
    filters: ["Vegetarian"],
    notes: "Test combo fixture",
    allergens: [],
    instructions: "Serve together.",
    isDraft: true,
    ...overrides,
  };
}
