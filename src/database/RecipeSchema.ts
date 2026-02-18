import mongoose, { Schema } from "mongoose";
import Ingredient from "./IngredientSchema";

const RecipeSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: false },

    serving: {
      type: Number,
      required: function () {
        return !this.isDraft;
      },
    },

    tags: { type: [String], required: false },

    ingredients: {
      type: [Ingredient.schema],
      required: function () {
        return !this.isDraft;
      },
    },

    instructions: { type: String, required: false },
    comments: { type: String, required: false },
    imageUrl: { type: String, required: false },
    lastVerified: { type: Date, required: false },
    verifiedBy: { type: String, required: false },
    isDraft: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
