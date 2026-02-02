import connectDB, { postRecipe } from "@/database/db";
import Recipe from "@/database/RecipeSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = 10; // number of recipes per page
    const skip = (page - 1) * limit;

    const [recipes, totalCount] = await Promise.all([
      Recipe.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Recipe.countDocuments(),
    ]);

    if (Math.ceil(totalCount / limit) < page) {
      return NextResponse.json({ error: "No recipes to display" }, { status: 404 });
    }

    return NextResponse.json(
      {
        data: recipes,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching recipes:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const recipeData = await req.json();
  const response = await postRecipe(recipeData);
  try {
    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    console.error("Error creating recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
