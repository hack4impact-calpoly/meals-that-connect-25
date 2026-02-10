import mongoose from "mongoose";
import RecipeModel from "./RecipeSchema";
let connection: typeof mongoose;

/**
 * Makes a connection to a MongoDB database. If a connection already exists, does nothing
 * Call this function before all api routes
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async () => {
  if (!connection) {
    const url = process.env.MONGO_URI as string;
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

export async function getRecipeById(id: string) {
  const connection = await connectDB();
  const recipe = await RecipeModel.findById(id).exec();
  return recipe;
}

export async function fetchRecipesByTags(tagParams: Array<string> | null, page: number = 1, limit: number = 10) {
  const connection = await connectDB();
  const filter =
    tagParams && tagParams.length ? { tags: { $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")) } } : {};
  return await RecipeModel.find(filter)
    .skip((page - 1) * limit)
    .limit(limit);
}

export default connectDB;
