type Recipe = {
  name: string;
  servings: number;
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
    let response = await fetch("/api/recipes/" + id);
    console.log(response);
    recipe = await response.json();
  } catch (error) {
    console.log(error);
    return <div>Error loading recipe.</div>;
  }

  /*const recipe: Recipe = {
    name: "Test Recipe",
    servings: 4,
    tags: ["Dinner", "Easy"],
    ingredients: [
      { name: "Chicken", quantity: "2 lbs" },
      { name: "Salt", quantity: "1 tsp" },
    ],
    instructions: "Cook the chicken with salt.",
    comments: "Delicious and easy to make!",
    lastVerified: new Date(),
    verifiedBy: "Chef John",
  };*/

  return (
    <div className="border w-fit p-3">
      <h1 className="text-xl p-2 pl-0 font-bold">{recipe.name}</h1>
      <p>
        <b>Tags:</b> {recipe.tags.join(", ")}
      </p>
      <p>
        <b>Servings:</b> {recipe.servings}
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
