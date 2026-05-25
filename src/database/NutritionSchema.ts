import mongoose, { Schema } from "mongoose";

const NutritionSchema = new Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  fatPercentage: { type: Number, default: 0 },
  saturatedFatPercentage: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  calcium: { type: Number, default: 0 },
  magnesium: { type: Number, default: 0 },
  potassium: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  vitaminA: { type: Number, default: 0 },
  vitaminD: { type: Number, default: 0 },
  vitaminC: { type: Number, default: 0 },
  vitaminB12: { type: Number, default: 0 },
});

export default mongoose.models.Nutrition || mongoose.model("Nutrition", NutritionSchema);
