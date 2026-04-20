import mongoose, { Schema } from "mongoose";

const SubrecipeSchema = new Schema({
  name: { type: String, required: true, unique: false },
  quantity: { type: Number, required: true },
  units: { type: String, required: true },
  notes: { type: String },
});

export default mongoose.models.Subrecipe || mongoose.model("Subrecipe", SubrecipeSchema);
