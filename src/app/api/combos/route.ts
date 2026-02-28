import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;

    const name = searchParams.get("name")?.trim();
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const isDraftParam = searchParams.get("isDraft");

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (isDraftParam === "true") {
      filter.isDraft = true;
    } else if (isDraftParam === "false") {
      filter.isDraft = false;
    }

    const totalCount = await Combo.countDocuments(filter);

    const combos = await Combo.find(filter)
      .skip((page - 1) * limit)
      .limit(limit);

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
