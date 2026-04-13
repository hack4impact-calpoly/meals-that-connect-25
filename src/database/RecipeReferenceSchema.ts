import mongoose, { Schema } from "mongoose";

const RecipeReferenceSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true, unique: false },
});

export default mongoose.models.RecipeReference || mongoose.model("RecipeReference", RecipeReferenceSchema);
