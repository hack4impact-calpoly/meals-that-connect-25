import mongoose, { Schema } from "mongoose";
import Ingredient from "./IngredientSchema";

const ComboSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },
    serving: { type: Number, required: true },
    sides: { type: [Ingredient.schema], required: false },
    fruits: { type: [Ingredient.schema], required: false },
    filters: { type: [String], required: false },
    notes: { type: String, required: false },
    allergens: { type: [String], required: false },
    instructions: { type: String, required: false },
    nutritional_info: { type: [Number], required: false },
    imageUrl: { type: String, required: false },
    isDraft: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Combo || mongoose.model("Combo", ComboSchema);
