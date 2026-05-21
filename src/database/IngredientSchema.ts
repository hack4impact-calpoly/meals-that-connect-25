import mongoose, { Schema } from "mongoose";

const IngredientSchema = new Schema({
  name: { type: String, required: true, unique: false },
  quantity: { type: Number, required: true },
  units: { type: String, required: true },
  notes: { type: String, required: false, default: "" },
});

export default mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);
