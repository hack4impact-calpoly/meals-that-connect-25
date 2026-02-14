import { NextRequest, NextResponse } from "next/server";
import Recipe from "@/database/RecipeSchema";
import connectDB, { getRecipeById, searchRecipesByName } from "@/database/db";

type Params = {
  params: {
    id: string;
  };
};
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name")?.trim();

  if (name) {
    try {
      const recipes = await searchRecipesByName(name);

      if (recipes.length === 0) {
        return NextResponse.json({ error: "No recipes found matching that name" }, { status: 404 });
      }

      return NextResponse.json(recipes, { status: 200 });
    } catch (err) {
      console.error("Error searching recipes:", err);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  } else if (searchParams.has("name")) {
    // ?name= exists but empty
    return NextResponse.json({ error: "Search query cannot be empty" }, { status: 400 });
  }

  // If no name query param → fetch by id
  try {
    await connectDB();
    const recipe = await getRecipeById(id);

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(recipe, { status: 200 });
  } catch (err) {
    console.error("Error fetching recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
  }

  let updates = {};
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true, // return the updated document instead of the original
        runValidators: true, // otherwise could bypass schema validation
        strict: "throw", // throw error on unknown fields
      },
    );

    if (!updatedRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ValidationError" || err?.name === "StrictModeError") {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    console.error("Error updating recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing Recipe ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedRecipe = await Recipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Recipe deleted successfully", id: deletedRecipe._id }, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
