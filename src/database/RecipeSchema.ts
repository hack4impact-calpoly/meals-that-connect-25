import mongoose, { Schema } from "mongoose";
import IngredientSchema from "./IngredientSchema";

const RecipeSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },
    serving: { type: Number, required: true },
    tags: { type: [String], required: false },
    ingredients: { type: [IngredientSchema], required: true },
    instructions: { type: String, required: false },
    comments: { type: String, required: false },
    lastVerified: { type: Date, required: false },
    verifiedBy: { type: String, required: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.User || mongoose.model("Recipe", RecipeSchema);
