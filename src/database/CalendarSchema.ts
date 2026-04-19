import mongoose, { Schema } from "mongoose";

const CalendarSchema = new Schema(
  {
    _id: { type: String, required: true }, // YYYYMMDD
    entrees: { type: [String], ref: "Recipe", required: false },
    vegetables: { type: [String], ref: "Recipe", required: false },
    grains: { type: [String], ref: "Recipe", required: false },
    fruits: { type: [String], ref: "Recipe", required: false },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Calendar || mongoose.model("Calendar", CalendarSchema);
