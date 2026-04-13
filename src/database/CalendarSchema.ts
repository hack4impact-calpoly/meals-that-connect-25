import mongoose, { Schema } from "mongoose";
import RecipeReference from "./RecipeReferenceSchema";

const CalendarSchema = new Schema(
  {
    _id: { type: String, required: true }, // YYYYMMDD
    entrees: { type: [RecipeReference.schema], required: false },
    fruits: { type: [RecipeReference.schema], required: false },
    sides: { type: [RecipeReference.schema], required: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Calendar || mongoose.model("Calendar", CalendarSchema);
