import crypto from "crypto";
import Recipe from "@/database/RecipeSchema";

// These functions are used for generating mock recipes for testing purpouses

export async function seedRecipes(count: number, overrides: any = {}) {
  const recipes = Array.from({ length: count }, () => makeRecipe(overrides));
  await Recipe.insertMany(recipes);
  return recipes;
}

export function makeIngredient(overrides = {}) {
  return {
    name: "Carrot",
    quantity: "2g",
    ...overrides,
  };
}

export function makeRecipe(overrides = {}) {
  return {
    _id: crypto.randomUUID(),
    name: "Vegetable Soup",
    serving: 4,
    tags: ["Side", "Soup", "Vegetarian"],
    ingredients: [makeIngredient(), makeIngredient({ name: "Potato", quantity: "3g" })],
    instructions: "Chop vegetables and simmer.",
    comments: "Test fixture",
    ...overrides,
  };
}
