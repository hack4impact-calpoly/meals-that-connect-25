import mongoose, { Schema } from "mongoose";

const IngredientSchema = new Schema({
  name: { type: String, required: true, unique: false },
  quantity: { type: String, required: true },
});

export default mongoose.models.Ingredient || mongoose.model("Ingredient", IngredientSchema);
