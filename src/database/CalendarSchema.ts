import mongoose, { Schema } from "mongoose";
import Nutrition from "./NutritionSchema";

const CalendarSchema = new Schema(
  {
    _id: { type: String, required: true }, // YYYYMMDD
    entrees: { type: [String], ref: "Recipe", required: false },
    fruits: { type: [String], ref: "Recipe", required: false },
    sides: { type: [String], ref: "Recipe", required: false },
    nutritional_info: { type: Nutrition.schema, required: true, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Calendar || mongoose.model("Calendar", CalendarSchema);
