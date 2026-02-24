import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";

export async function GET(req?: NextRequest) {
  try {
    await connectDB();
    const name = req?.nextUrl?.searchParams.get("name")?.trim();
    const combos = name ? await Combo.find({ name: { $regex: name, $options: "i" } }) : await Combo.find();
    return NextResponse.json(combos, { status: 200 });
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
