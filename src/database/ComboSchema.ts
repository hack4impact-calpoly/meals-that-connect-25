import mongoose, { Schema } from "mongoose";
import Ingredient from "./IngredientSchema";

const ComboSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },
    serving: { type: Number, required: true },
    sides: { type: [Ingredient], required: false },
    fruits: { type: [Ingredient], required: false },
    filters: { type: [String], required: false },
    notes: { type: String, required: false },
    allergens: { type: String, required: false },
    instructions: { type: String, required: false },
    nutritional_info: { type: [Number], required: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.ComboSchema || mongoose.model("Combo", ComboSchema);
