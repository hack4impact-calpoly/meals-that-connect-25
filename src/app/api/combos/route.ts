import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";

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
    const sortBy = searchParams.get("sortBy") ?? "createdDate";

    const tagParams = searchParams
      .getAll("filters")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const servingParams = searchParams
      .getAll("servings")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (tagParams.length > 0) {
      filter.filters = {
        $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")),
      };
    }

    const servingRanges = servingParams
      .map((serving) => SERVING_FILTER_RANGES[serving])
      .filter((range): range is ServingRange => Boolean(range));

    if (servingRanges.length > 0) {
      filter.$or = servingRanges.map((range) =>
        range.max != null ? { serving: { $gte: range.min, $lte: range.max } } : { serving: { $gte: range.min } },
      );
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
  try {
    const comboData = await req.json();
    await connectDB();
    console.log(comboData, "COMBO DATA!");
    const combo = new Combo(comboData);
    await combo.save();

    return NextResponse.json(combo, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return NextResponse.json({ error: "invalid data" }, { status: 400 });
    }
    console.error("Error creating combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
