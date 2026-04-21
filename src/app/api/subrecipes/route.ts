import connectDB, { postSubrecipe } from "@/database/db";
import Subrecipe from "@/database/SubrecipeSchema";
import { NextRequest, NextResponse } from "next/server";

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
        filters: {
          $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")),
        },
        allergens: {
          $all: tagParams.map((tag) => new RegExp(`^${tag}$`, "i")),
        },
      });
    }

    if (categoryParams.length > 0) {
      andClauses.push({
        $or: categoryParams.map((category) => ({
          type: { $regex: category, $options: "i" },
        })),
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

    const totalCount = await Subrecipe.countDocuments(filter);
    console.log(`Filter: ${JSON.stringify(filter)}, Total Count: ${totalCount}`);

    let query = Subrecipe.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    if (sortBy === "aToZ" || sortBy === "zToA") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    const subrecipes = await query;

    return NextResponse.json(
      {
        data: subrecipes,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching subrecipes:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const subrecipeData = await req.json();
    const response = await postSubrecipe(subrecipeData);
    return NextResponse.json(response, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ValidationError") {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Error creating subrecipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
