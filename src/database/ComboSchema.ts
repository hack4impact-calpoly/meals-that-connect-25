import mongoose, { Schema } from "mongoose";

const ComboSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },

    serving: {
      type: Number,
      required: true,
    },

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

    filters: {
      type: [String],
      required: false,
      default: [],
    },

    allergens: {
      type: [String],
      required: false,
      default: [],
    },

    notes: { type: String, required: false },
    instructions: { type: String, required: false },
    imageUrl: { type: String, required: false },

    isDraft: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Combo || mongoose.model("Combo", ComboSchema);
