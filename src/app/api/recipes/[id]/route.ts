import { NextRequest, NextResponse } from "next/server";
import connectDB, { getRecipeById } from "@/database/db";
import Recipe from "@/database/RecipeSchema";
import { RECIPE_CATEGORIES } from "@/lib/types";
import type { RecipeCategory } from "@/lib/types";

type Params = {
  params: Promise<{ id: string }>;
};

function isRecipeCategory(value: unknown): value is RecipeCategory {
  return typeof value === "string" && RECIPE_CATEGORIES.includes(value as RecipeCategory);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
  }

  try {
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
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Recipe ID is required" }, { status: 400 });
  }

  let updates: Record<string, unknown>;

  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if ("category" in updates && !isRecipeCategory(updates.category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  try {
    await connectDB();

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        strict: "throw",
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

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing Recipe ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const deletedRecipe = await Recipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Recipe deleted successfully",
        id: deletedRecipe._id,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("Error deleting recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
