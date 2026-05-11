import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Calendar from "@/database/CalendarSchema";
import Recipe from "@/database/RecipeSchema";
import { RECIPE_BUCKETS } from "@/lib/types";
import type { RecipeBucket, RecipeBuckets } from "@/lib/types";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

type CalendarRecipePreview = {
  _id: string;
  name: string;
  serving?: number;
};

type CalendarDayResponse = {
  _id: string;
} & RecipeBuckets<CalendarRecipePreview>;

const populateBucketPaths = RECIPE_BUCKETS.map((bucket) => ({ path: bucket }));

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
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Calendar ID is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const calendarDay = await Calendar.findById(id).exec();

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    const allIds = Array.from(new Set(RECIPE_BUCKETS.flatMap((bucket) => getBucketIds(calendarDay, bucket))));

    const recipeDocs = await Recipe.find({ _id: { $in: allIds } })
      .lean()
      .exec();

    const recipeLookup = new Map<string, CalendarRecipePreview>();

    recipeDocs.forEach((doc) => {
      if (doc._id) {
        recipeLookup.set(doc._id.toString(), {
          _id: doc._id.toString(),
          name: doc.name,
          serving: doc.serving,
        });
      }
    });

    const resolveRecipes = (ids: string[]) =>
      ids.map((id) => recipeLookup.get(id) ?? { _id: id, name: id, serving: undefined });

    const buckets = RECIPE_BUCKETS.reduce<RecipeBuckets<CalendarRecipePreview>>(
      (acc, bucket) => {
        acc[bucket] = resolveRecipes(getBucketIds(calendarDay, bucket));
        return acc;
      },
      {
        entrees: [],
        vegetables: [],
        fruits: [],
        grains: [],
      },
    );

    const response: CalendarDayResponse = {
      _id: calendarDay._id.toString(),
      ...buckets,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error("Error fetching calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;

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

    await Calendar.findOneAndUpdate({ _id: id }, { $addToSet: { [category]: recipeId } }, { upsert: true });

    const updatedDay = await Calendar.findById(id).populate(populateBucketPaths).exec();

    return NextResponse.json(updatedDay, { status: 200 });
  } catch (err) {
    console.error("Error updating calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

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

    const calendarDay = await Calendar.findById(id);

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    const currentIds = getBucketIds(calendarDay, category);

    calendarDay.set(
      category,
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
