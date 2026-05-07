import mongoose, { Schema } from "mongoose";

const CalendarSchema = new Schema(
  {
    _id: { type: String, required: true }, // YYYYMMDD

    entrees: {
      type: [{ type: String, ref: "Recipe" }],
      required: false,
      default: [],
    },

    vegetables: {
      type: [{ type: String, ref: "Recipe" }],
      required: false,
      default: [],
    },

    fruits: {
      type: [{ type: String, ref: "Recipe" }],
      required: false,
      default: [],
    },

    grains: {
      type: [{ type: String, ref: "Recipe" }],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Calendar || mongoose.model("Calendar", CalendarSchema);
