import { getRecipeById } from "@/database/db";

type Recipe = {
  name: string;
  serving: number;
  tags: string[];
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string;
  comments: string;
  lastVerified: Date;
  verifiedBy: string;
};
//{ recipe }: { recipe: Recipe }
export default async function RecipeCard({ id }: { id: string }) {
  let recipe: Recipe;
  try {
    recipe = await getRecipeById(id);
    if (!recipe) {
      return <div className="border w-fit">Recipe not found.</div>;
    }
  } catch (error) {
    console.log(error);
    return <div className="border w-fit">Error loading recipe.</div>;
  }

  return (
    <div className="border w-fit p-3">
      <h1 className="text-xl p-2 font-bold">{recipe.name}</h1>
      <p>
        <b>Tags:</b> {recipe.tags.join(", ")}
      </p>
      <p>
        <b>Servings:</b> {recipe.serving}
      </p>
      <h2>
        <b>Ingredients:</b>
      </h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.quantity} {ingredient.name}
          </li>
        ))}
      </ul>
      <p>
        <b>Instructions:</b> {recipe.instructions}
      </p>
      <p>
        <b>Comments:</b> {recipe.comments}
      </p>
      <p>
        <b>Last Verified Date:</b> {recipe.lastVerified.toLocaleDateString()}
      </p>
      <p>
        <b>Verified By:</b> {recipe.verifiedBy}
      </p>
    </div>
  );
}
