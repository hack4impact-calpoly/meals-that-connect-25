import mongoose, { Schema } from "mongoose";
import Nutrition from "./NutritionSchema";

const RecipeSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: false },
    type: { type: String, required: true },
    serving: {
      type: Number,
      required: true,
    },

    allergens: { type: [String], required: false },
    filters: { type: [String], required: false },

    subrecipes: [
      {
        subrecipeID: {
          type: String,
          ref: "Subrecipe",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

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
