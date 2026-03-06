import connectDB, { postRecipe } from "@/database/db";
import Recipe from "@/database/RecipeSchema";
import { NextRequest, NextResponse } from "next/server";

type ServingRange = {
  min: number;
  max?: number;
};

const SERVING_FILTER_RANGES: Record<string, ServingRange> = {
  "single-serving": { min: 1, max: 1 },
  "small-serving": { min: 2, max: 3 },
  "family-serving": { min: 4, max: 6 },
  "party-serving": { min: 7 },
};

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
    const categoryParams = searchParams
      .getAll("categories")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);
    const servingParams = searchParams
      .getAll("servings")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const andClauses: any[] = [];

    if (tagParams.length > 0) {
      andClauses.push({
        tags: {
          $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")),
        },
      });
    }

    if (categoryParams.length > 0) {
      andClauses.push({
        $or: categoryParams.map((category) => ({
          tags: { $elemMatch: { $regex: category, $options: "i" } },
        })),
      });
    }

    const servingRanges = servingParams
      .map((serving) => SERVING_FILTER_RANGES[serving])
      .filter((range): range is ServingRange => Boolean(range));

    if (servingRanges.length > 0) {
      andClauses.push({
        $or: servingRanges.map((range) =>
          range.max != null ? { serving: { $gte: range.min, $lte: range.max } } : { serving: { $gte: range.min } },
        ),
      });
    }

    if (andClauses.length > 1) {
      filter.$and = andClauses;
    } else if (andClauses.length === 1) {
      Object.assign(filter, andClauses[0]);
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
