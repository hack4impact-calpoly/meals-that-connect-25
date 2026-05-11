import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import { getCalendarNutritionSummaries } from "@/database/calendarNutrition";

export async function GET(req: NextRequest) {
  try {
    const ids = (req.nextUrl.searchParams.get("ids") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "ids query param is required" }, { status: 400 });
    }

    await connectDB();
    const data = await getCalendarNutritionSummaries(ids);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching calendar nutrition:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
