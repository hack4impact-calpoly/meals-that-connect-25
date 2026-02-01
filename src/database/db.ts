import mongoose from "mongoose";
import RecipeModel from "./RecipeSchema";
const url: string = process.env.MONGO_URI as string;
let connection: typeof mongoose;

/**
 * Makes a connection to a MongoDB database. If a connection already exists, does nothing
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  if (!connection) {
    connection = await mongoose.connect(url);
    return connection;
  }
};

export async function postRecipe(recipeData: typeof RecipeModel.prototype) {
  const connection = await connectDB();
  const recipe = new RecipeModel(recipeData);
  await recipe.save();
  return recipe;
}

export async function fetchRecipiesByTags(tagParams: Array<string> | null) {
  const connection = await connectDB();
  const filter = tagParams && tagParams.length ? { tags: { $all: tagParams } } : {};
  return await RecipeModel.find(filter);
}
export default connectDB;
