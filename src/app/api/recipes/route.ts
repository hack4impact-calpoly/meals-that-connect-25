import { fetchRecipesByTags, postRecipe } from "@/database/db";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tagParams = url.searchParams.getAll("tags").map((t) => t.trim().toLowerCase());
  const response = await fetchRecipesByTags(tagParams);
  try {
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Error fetching recipes by tags:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
