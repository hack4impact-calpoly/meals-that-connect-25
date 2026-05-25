import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";
import { getNormalizedParams } from "@/lib/server/searchParams";
import { DIETARY_KEYS, EXCLUSION_KEYS, PROTEIN_SOURCES, RECIPE_BUCKETS } from "@/lib/types";
import {
  deriveComboDataFromRecipeIds,
  getCleanName,
  getRecipeBucketsFromBody,
  isDuplicateNameError,
  nameFieldError,
} from "@/lib/server/comboHelpers";

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

    const pageParam = Number(searchParams.get("page") ?? 1);
    const limitParam = Number(searchParams.get("limit") ?? 10);

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 10;

    const isDraftParam = searchParams.get("isDraft");
    const sortBy = searchParams.get("sortBy") ?? "createdDate";
    const populate = searchParams.get("populate");

    const proteinSourceParams = getNormalizedParams(searchParams, "proteinSources", PROTEIN_SOURCES);

    const dietaryParams = getNormalizedParams(searchParams, "dietary", DIETARY_KEYS);

    const exclusionParams = getNormalizedParams(searchParams, "exclusions", EXCLUSION_KEYS);

    const populateSelectMap = {
      // "all" just populates everything, no map needed
      preview: "_id name category",
      nutrition: "_id name category serving nutritional_info",
      filters: "_id name serving category proteinSources dietary exclusions",
    } as const;

    const servingParams = searchParams
      .getAll("servings")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    const andClauses: any[] = [];

    if (proteinSourceParams.length > 0) {
      // proteinSources=Chicken&proteinSources=Tofu
      // means Chicken OR Tofu
      andClauses.push({
        proteinSources: { $in: proteinSourceParams },
      });
    }

    // These are AND filters.
    // dietary=halal&dietary=vegetarian means halal AND vegetarian.
    for (const dietaryKey of dietaryParams) {
      andClauses.push({
        [`dietary.${dietaryKey}`]: true,
      });
    }

    // exclusions=glutenFree&exclusions=nutFree
    // means glutenFree AND nutFree.
    for (const exclusionKey of exclusionParams) {
      andClauses.push({
        [`exclusions.${exclusionKey}`]: true,
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

    const totalCount = await Combo.countDocuments(filter);

    let query = Combo.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    if (populate === "all") {
      RECIPE_BUCKETS.forEach((bucket) => {
        query.populate(bucket);
      });
    } else if (populate === "preview" || populate === "nutrition" || populate === "filters") {
      RECIPE_BUCKETS.forEach((bucket) => {
        query.populate(bucket, populateSelectMap[populate]);
      });
    }

    if (sortBy === "aToZ" || sortBy === "zToA") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    const combos = await query;

    return NextResponse.json(
      {
        data: combos,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching combos:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let comboData: Record<string, unknown>;

  try {
    comboData = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();

    const name = getCleanName(comboData);

    if (!name) {
      return nameFieldError("Name cannot be empty.");
    }

    const existingCombo = await Combo.exists({ name });

    if (existingCombo) {
      return nameFieldError("Name is already taken.", 409);
    }

    const recipeBuckets = getRecipeBucketsFromBody(comboData);
    const calculatedFilters = await deriveComboDataFromRecipeIds(recipeBuckets);

    const combo = new Combo({
      ...comboData,
      name,

      // Filters are always derived in the backend.
      // Here we overwrite anything the frontend may have sent.
      ...calculatedFilters,
    });

    await combo.save();

    return NextResponse.json(combo, { status: 201 });
  } catch (err: any) {
    if (isDuplicateNameError(err)) {
      return nameFieldError("Name is already taken.", 409);
    }

    if (err?.name === "ValidationError") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    if (err?.message?.includes("Invalid") || err?.message?.includes("could not be found")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("Error creating combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
