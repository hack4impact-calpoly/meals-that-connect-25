import mongoose, { Schema } from "mongoose";
import Ingredient from "./IngredientSchema";
import Nutrition from "./NutritionSchema";
import { RECIPE_CATEGORIES } from "@/lib/types";

const RecipeSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },

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
      required: true,
    },

    allergens: { type: [String], required: false },
    filters: { type: [String], required: false },

    ingredients: {
      type: [Ingredient.schema],
      required: false,
    },

    instructions: { type: String, required: false },
    notes: { type: String, required: false },
    imageUrl: { type: String, required: false },
    lastVerified: { type: Date, required: false },
    verifiedBy: { type: String, required: false },
    isDraft: { type: Boolean, required: true, default: true },
    nutritional_info: { type: Nutrition.schema, required: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
