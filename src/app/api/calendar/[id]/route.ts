import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Calendar from "@/database/CalendarSchema";
import Recipe from "@/database/RecipeSchema";
import Combo from "@/database/ComboSchema";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const allIds = Array.from(
      new Set([
        ...(calendarDay.entrees || []),
        ...(calendarDay.fruits || []),
        ...(calendarDay.grains || []),
        ...(calendarDay.vegetables || []),
      ]),
    );

    const [recipeDocs, comboDocs] = await Promise.all([
      Recipe.find({ _id: { $in: allIds } })
        .lean()
        .exec(),
      Combo.find({ _id: { $in: allIds } })
        .lean()
        .exec(),
    ]);

    const itemLookup = new Map<
      string,
      { _id: string; name: string; type: string; serving?: number; calories?: number }
    >();

    recipeDocs.forEach((doc) => {
      if (doc._id) {
        itemLookup.set(doc._id.toString(), {
          _id: doc._id.toString(),
          name: doc.name,
          type: doc.type,
          serving: doc.serving,
          calories: doc.nutritional_info.calories,
        });
      }
    });

    comboDocs.forEach((doc) => {
      if (doc._id) {
        itemLookup.set(doc._id.toString(), {
          _id: doc._id.toString(),
          name: doc.name,
          type: doc.type,
          serving: doc.serving,
          calories: doc.nutritional_info.calories,
        });
      }
    });

    const resolveItems = (ids: string[] = []) =>
      ids.map(
        (id) => itemLookup.get(id) ?? { _id: id, name: id, type: undefined, serving: undefined, calories: undefined },
      );

    return NextResponse.json(
      {
        _id: calendarDay._id,
        entrees: resolveItems(calendarDay.entrees),
        fruits: resolveItems(calendarDay.fruits),
        grains: resolveItems(calendarDay.grains),
        vegetables: resolveItems(calendarDay.vegetables),
      },
      { status: 200 },
    );
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

    if (!["entrees", "sides", "fruits", "grains", "vegetables"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const update = { $addToSet: { [category]: recipeId } };
    await Calendar.findOneAndUpdate({ _id: id }, update, { upsert: true });

    const updatedDay = await Calendar.findById(id)
      .populate("entrees")
      .populate("fruits")
      .populate("sides")
      .populate("grains")
      .populate("vegetables")
      .exec();

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

    if (!["entrees", "sides", "fruits", "grains", "vegetables"].includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const calendarDay = await Calendar.findById(id);

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    calendarDay[category] = calendarDay[category].filter((itemId: string) => itemId !== recipeId);

    await calendarDay.save();

    const updatedDay = await Calendar.findById(id)
      .populate("entrees")
      .populate("fruits")
      .populate("grains")
      .populate("vegetables")
      .exec();

    return NextResponse.json(updatedDay, { status: 200 });
  } catch (err) {
    console.error("Error deleting recipe from calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
