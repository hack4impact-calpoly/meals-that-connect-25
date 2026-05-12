import mongoose, { Schema } from "mongoose";

const NutritionSchema = new Schema({
  calories: { type: Number, required: true, default: 0 },
  protein: { type: Number, required: true, default: 0 },
  fat: { type: Number, required: true, default: 0 },
  carbs: { type: Number, required: true, default: 0 },
  fiber: { type: Number, required: true, default: 0 },
  sodium: { type: Number, required: true, default: 0 },
});

export default mongoose.models.Nutrition || mongoose.model("Nutrition", NutritionSchema);
