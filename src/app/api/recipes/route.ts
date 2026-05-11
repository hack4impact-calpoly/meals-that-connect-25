import connectDB, { postRecipe } from "@/database/db";
import Recipe from "@/database/RecipeSchema";
import { getNormalizedParams } from "@/lib/server/searchParams";
import { DIETARY_KEYS, EXCLUSION_KEYS, PROTEIN_SOURCES, RECIPE_CATEGORIES } from "@/lib/types";
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
    const isSubrecipeParam = searchParams.get("isSubrecipe");
    const sortBy = searchParams.get("sortBy") ?? "createdDate";

    const tagParams = searchParams
      .getAll("filters")
      .concat(searchParams.getAll("tags"))
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    const categoryParams = getNormalizedParams(searchParams, "categories", RECIPE_CATEGORIES);
    const proteinSourceParams = getNormalizedParams(searchParams, "proteinSources", PROTEIN_SOURCES);
    const dietaryParams = getNormalizedParams(searchParams, "dietary", DIETARY_KEYS);
    const exclusionParams = getNormalizedParams(searchParams, "exclusions", EXCLUSION_KEYS);

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
      const tagRegexes = tagParams.map((tag) => new RegExp(`^${tag}$`, "i"));

      andClauses.push({
        $or: [{ filters: { $all: tagRegexes } }, { tags: { $all: tagRegexes } }, { allergens: { $all: tagRegexes } }],
      });
    }

    if (proteinSourceParams.length > 0) {
      andClauses.push({
        proteinSources: { $in: proteinSourceParams },
      });
    }

    for (const dietaryKey of dietaryParams) {
      andClauses.push({
        [`dietary.${dietaryKey}`]: true,
      });
    }

    for (const exclusionKey of exclusionParams) {
      andClauses.push({
        [`exclusions.${exclusionKey}`]: true,
      });
    }

    if (categoryParams.length > 0) {
      andClauses.push({
        category: { $in: categoryParams },
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

    if (isSubrecipeParam === "true") {
      filter.isSubrecipe = true;
    } else if (isSubrecipeParam === "false") {
      filter.isSubrecipe = false;
    }

    let sort: Record<string, 1 | -1> = { createdAt: -1 };

    switch (sortBy) {
      case "lastUpdated":
        sort = { updatedAt: -1 };
        break;
      case "createdDate":
        sort = { createdAt: -1 };
        break;
      case "aToZ":
        sort = { name: 1 };
        break;
      case "zToA":
        sort = { name: -1 };
        break;
    }

    const totalCount = await Recipe.countDocuments(filter);
    let query = Recipe.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    if (sortBy === "aToZ" || sortBy === "zToA") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    const recipes = await query;

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
