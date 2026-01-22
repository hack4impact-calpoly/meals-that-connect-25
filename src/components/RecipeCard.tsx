type Recipe = {
  name: String;
  serving: Number;
  tags: [String];
  ingredients: {
    name: String;
    quantity: String;
  };
  instructions: String;
  comments: String;
  lastVerified: Date;
  verifiedBy: String;
};
//{ recipe }: { recipe: Recipe }
export default function RecipeCard() {
  return (
    <div className="border">
      <h1>Recipe Name</h1>
      <p>Tags</p>
      <p>Servings</p>
      <h2>Ingredients: 1, 2, 3</h2>
      <p>Instructions</p>
      <p>Comments</p>
      <p>Last Verified Date</p>
      <p>Verified By</p>
    </div>
  );
}
