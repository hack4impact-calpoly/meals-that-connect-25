import mongoose, { Schema } from "mongoose";

const ComboSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },
    serving: { type: Number, required: true },
    entrees: { type: [String], ref: "Recipe", required: false },
    sides: { type: [String], ref: "Recipe", required: false },
    fruits: { type: [String], ref: "Recipe", required: false },
    filters: { type: [String], required: false },
    notes: { type: String, required: false },
    allergens: { type: [String], required: false },
    instructions: { type: String, required: false },
    imageUrl: { type: String, required: false },
    isDraft: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Combo || mongoose.model("Combo", ComboSchema);
