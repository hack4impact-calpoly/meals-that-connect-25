import { postRecipe } from "@/database/db";
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
