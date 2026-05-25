import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import "@/database/RecipeSchema";
import Calendar from "@/database/CalendarSchema";
import { getCalendarNutritionSummaries } from "@/database/calendarNutrition";
import { normalizeNutrition } from "@/lib/nutrition";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { Nutrition, RecipeBucket, RecipeBuckets, RecipeCategory } from "@/lib/types";

type Params = {
  params: Promise<{ id: string }> | { id: string };
};

type CalendarRecipePreview = {
  _id: string;
  name: string;
  category: RecipeCategory;
  serving?: number;
  imageUrl?: string;
  nutritional_info?: Nutrition;
};

type CalendarDayResponse = {
  _id: string;
  nutritional_info: Nutrition;
  quotaMet: boolean;
} & RecipeBuckets<CalendarRecipePreview>;

const populateBucketPaths = RECIPE_BUCKETS.map((bucket) => ({
  path: bucket,
  select: "_id name category serving imageUrl nutritional_info",
}));

async function getRouteParams(params: Params["params"]) {
  return await params;
}

function isRecipeBucket(value: unknown): value is RecipeBucket {
  return typeof value === "string" && RECIPE_BUCKETS.includes(value as RecipeBucket);
}

function getBucketIds(calendarDay: { get: (path: string) => unknown }, bucket: RecipeBucket): string[] {
  const value = calendarDay.get(bucket);

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((id) => id.toString());
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await getRouteParams(params);

  if (!id) {
    return NextResponse.json({ error: "Calendar ID is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const calendarDay = await Calendar.findById(id).populate(populateBucketPaths).lean<CalendarDayResponse>().exec();

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    const [nutritionSummary] = await getCalendarNutritionSummaries([id]);

    return NextResponse.json(
      {
        ...calendarDay,
        nutritional_info: nutritionSummary?.nutritional_info ?? normalizeNutrition(calendarDay.nutritional_info),
        quotaMet: nutritionSummary?.quotaMet ?? false,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await getRouteParams(params);

  if (!id) {
    return NextResponse.json({ error: "Calendar ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { recipeId, category } = body;

    if (!recipeId || !category) {
      return NextResponse.json({ error: "recipeId and category are required" }, { status: 400 });
    }

    if (!isRecipeBucket(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    await Calendar.findOneAndUpdate(
      { _id: id },
      { $addToSet: { [category]: recipeId } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );

    const updatedDay = await Calendar.findById(id).populate(populateBucketPaths).exec();

    return NextResponse.json(updatedDay, { status: 200 });
  } catch (err) {
    console.error("Error updating calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await getRouteParams(params);

  if (!id) {
    return NextResponse.json({ error: "Calendar ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { recipeId, category: bucket } = body;

    if (!recipeId || !bucket) {
      return NextResponse.json({ error: "recipeId and category are required" }, { status: 400 });
    }

    if (!isRecipeBucket(bucket)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const calendarDay = await Calendar.findById(id);

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    const currentIds = getBucketIds(calendarDay, bucket);

    calendarDay.set(
      bucket,
      currentIds.filter((itemId) => itemId !== recipeId),
    );

    await calendarDay.save();

    const updatedDay = await Calendar.findById(id).populate(populateBucketPaths).exec();

    return NextResponse.json(updatedDay, { status: 200 });
  } catch (err) {
    console.error("Error deleting recipe from calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
