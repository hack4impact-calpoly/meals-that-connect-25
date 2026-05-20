import mongoose, { Schema } from "mongoose";
import Ingredient from "./IngredientSchema";
import Nutrition from "./NutritionSchema";
import { PROTEIN_SOURCES, RECIPE_CATEGORIES } from "@/lib/types";

const RecipeSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true, trim: true },

    isSubrecipe: {
      type: Boolean,
      default: false,
      required: true,
    },

    serving: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      enum: RECIPE_CATEGORIES,
      default: "Entree",
      required: true,
    },

    proteinSources: {
      type: [
        {
          type: String,
          enum: PROTEIN_SOURCES,
        },
      ],
      default: [],
    },

    dietary: {
      vegetarian: { type: Boolean, default: false },
      vegan: { type: Boolean, default: false },
      halal: { type: Boolean, default: false },
      kosher: { type: Boolean, default: false },
    },

    exclusions: {
      dairyFree: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      nutFree: { type: Boolean, default: false },
      soyFree: { type: Boolean, default: false },
      shellfishFree: { type: Boolean, default: false },
    },

    allergens: { type: [String], required: false, default: [] },
    tags: { type: [String], required: false, default: [] },
    filters: { type: [String], required: false, default: [] },

    ingredients: {
      type: [Ingredient.schema],
      required: true,
    },

    subrecipes: {
      type: [
        {
          recipeId: { type: String, ref: "Recipe", required: true },
          recipeName: { type: String, required: false },
          category: { type: String, required: false },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
    },

    instructions: { type: String, required: false },
    comments: { type: String, required: false },
    notes: { type: String, required: false },
    imageUrl: { type: String, required: false },
    lastVerified: { type: Date, required: false },
    verifiedBy: { type: String, required: false },
    isDraft: { type: Boolean, required: true, default: true },
    nutritional_info: { type: Nutrition.schema, required: true, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
