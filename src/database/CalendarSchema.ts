import mongoose, { Schema } from "mongoose";
import Nutrition from "./NutritionSchema";

const CalendarSchema = new Schema(
  {
    _id: { type: String, required: true }, // YYYYMMDD

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

    nutritional_info: { type: Nutrition.schema, required: true, default: () => ({}) },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Calendar || mongoose.model("Calendar", CalendarSchema);
