import mongoose, { Schema } from "mongoose";

const NutritionSchema = new Schema({
  calories: { type: Number, required: true },
  protein: { type: Number, required: true },
  fat: { type: Number, required: true },
  carbs: { type: Number, required: true },
  fiber: { type: Number, required: true },
  sodium: { type: Number, required: true },
});

export default mongoose.models.Nutrition || mongoose.model("Nutrition", NutritionSchema);
