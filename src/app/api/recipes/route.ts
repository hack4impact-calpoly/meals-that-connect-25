import { fetchRecipesByTags, postRecipe, searchRecipesByName } from "@/database/db";
import connectDB from "@/database/db";
import Recipe from "@/database/RecipeSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;

    const name = searchParams.get("name")?.trim();
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const isDraftParam = searchParams.get("isDraft");

    const tagParams = searchParams
      .getAll("tags")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (tagParams.length > 0) {
      filter.tags = {
        $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")),
      };
    }

    if (isDraftParam === "true") {
      filter.isDraft = true;
    } else if (isDraftParam === "false") {
      filter.isDraft = false;
    }

    const totalCount = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

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
  try {
    const recipeData = await req.json();
    const response = await postRecipe(recipeData);
    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error creating recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
