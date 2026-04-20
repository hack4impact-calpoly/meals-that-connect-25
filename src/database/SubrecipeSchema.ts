import mongoose, { Schema } from "mongoose";

const SubrecipeSchema = new Schema({
  _id: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: false },
  sizePack: { type: String, required: true },
  notes: { type: String },
  isDraft: { type: Boolean, required: true, default: true },
});

export default mongoose.models.Subrecipe || mongoose.model("Subrecipe", SubrecipeSchema);
