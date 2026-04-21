import mongoose from "mongoose";
import RecipeModel from "./RecipeSchema";
import ComboModel from "./ComboSchema";
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
export async function searchRecipesByName(name: string) {
  if (!name?.trim()) return [];
  await connectDB();
  const recipes = await RecipeModel.find({
    name: { $regex: name.trim(), $options: "i" },
  }).exec();
  return recipes;
}

export async function bulkDeleteRecipes(ids: string[]) {
  await connectDB();

  if (!ids.length) return { deletedCount: 0 };

  const result = await RecipeModel.deleteMany({
    _id: { $in: ids },
  });

  return result;
}

export async function bulkDeleteCombos(ids: string[]) {
  await connectDB();

  if (!ids.length) return { deletedCount: 0 };

  const result = await ComboModel.deleteMany({
    _id: { $in: ids },
  });

  return { deletedCount: result.deletedCount };
}

export async function bulkPublishRecipes(ids: string[]) {
  await connectDB();

  if (!ids.length) return { modifiedCount: 0 };

  const result = await RecipeModel.updateMany({ _id: { $in: ids } }, { $set: { isDraft: false } });

  return { modifiedCount: result.modifiedCount };
}

export async function bulkPublishCombos(ids: string[]) {
  await connectDB();

  if (!ids.length) return { modifiedCount: 0 };

  const result = await ComboModel.updateMany({ _id: { $in: ids } }, { $set: { isDraft: false } });

  return { modifiedCount: result.modifiedCount };
}

export default connectDB;
