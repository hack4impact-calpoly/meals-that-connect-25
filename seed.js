import connectDB from "@/database/db";
import Recipe from "@/database/RecipeSchema";

async function seedDatabase() {
  await connectDB();

  // Clear existing recipes
  await Recipe.deleteMany({});

  // Create test recipes
  const recipes = [
    {
      _id: "test-recipe-1",
      name: "Test Recipe (No Tags)",
      serving: 4,
      tags: [],
      ingredients: [{ name: "Test Ingredient", quantity: "1 cup" }],
      instructions: "Test instructions",
      isDraft: false,
    },
    {
      _id: "test-recipe-2",
      name: "Vegetable Soup (With Tags)",
      serving: 4,
      tags: ["Side", "Soup", "Vegetarian"],
      ingredients: [
        { name: "Carrot", quantity: "2g" },
        { name: "Potato", quantity: "3g" },
      ],
      instructions: "Chop vegetables and simmer.",
      isDraft: false,
    },
    {
      _id: "test-recipe-3",
      name: "Chicken Stir Fry (Entree)",
      serving: 2,
      tags: ["Entree"],
      ingredients: [
        { name: "Chicken", quantity: "200g" },
        { name: "Vegetables", quantity: "1 cup" },
      ],
      instructions: "Stir fry chicken and vegetables.",
      isDraft: false,
    },
  ];

  await Recipe.insertMany(recipes);
  console.log("Database seeded with test recipes");
  process.exit(0);
}

seedDatabase().catch(console.error);
