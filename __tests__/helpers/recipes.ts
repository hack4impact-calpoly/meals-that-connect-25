import crypto from "crypto";
import Recipe from "@/database/RecipeSchema";

// These functions are used for generating mock recipes for testing purposes

export async function seedRecipes(count: number, overrides: any = {}) {
  const recipes = Array.from({ length: count }, () => makeRecipe(overrides));
  await Recipe.insertMany(recipes);
  return recipes;
}

export function makeIngredient(overrides = {}) {
  return {
    name: "Carrot",
    quantity: 2,
    units: "g",
    ...overrides,
  };
}

export function makeNutrition(overrides = {}) {
  return {
    calories: 200,
    protein: 5,
    fat: 6,
    carbs: 30,
    fiber: 4,
    sodium: 120,
    ...overrides,
  };
}

export function makeRecipe(overrides = {}) {
  return {
    _id: crypto.randomUUID(),
    name: "Vegetable Soup",
    serving: 4,
    filters: ["Side", "Soup", "Vegetarian"],
    allergens: [],
    ingredients: [makeIngredient(), makeIngredient({ name: "Potato", quantity: 3 })],
    instructions: "Chop vegetables and simmer.",
    notes: "Test fixture",
    isDraft: true,
    nutritional_info: makeNutrition(),
    ...overrides,
  };
}
