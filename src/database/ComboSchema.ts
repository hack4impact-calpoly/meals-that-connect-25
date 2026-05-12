import { PROTEIN_SOURCES } from "@/lib/types";
import mongoose, { Schema } from "mongoose";
import Nutrition from "./NutritionSchema";

const ComboSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },

    serving: {
      type: Number,
      required: true,
    },

    entrees: {
      type: [{ type: String, ref: "Recipe" }],
      required: true,
      default: [],
    },

    vegetables: {
      type: [{ type: String, ref: "Recipe" }],
      required: true,
      default: [],
    },

    fruits: {
      type: [{ type: String, ref: "Recipe" }],
      required: true,
      default: [],
    },

    grains: {
      type: [{ type: String, ref: "Recipe" }],
      required: true,
      default: [],
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

    notes: { type: String, required: false },
    instructions: { type: String, required: false },
    imageUrl: { type: String, required: false },

    isDraft: {
      type: Boolean,
      required: true,
      default: true,
    },

    nutritional_info: { type: Nutrition.schema, required: true, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Combo || mongoose.model("Combo", ComboSchema);
