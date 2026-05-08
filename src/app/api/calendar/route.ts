import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Calendar from "@/database/CalendarSchema";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month")?.padStart(2, "0");

    if (year && month) {
      const yearMonth = `${year}${month}`;

      const result = await Calendar.find({ _id: { $regex: `^${yearMonth}` } })
        .populate("entrees")
        .populate("vegetables")
        .populate("fruits")
        .populate("grains")
        .exec();

      return NextResponse.json(result);
    }

    const result = await Calendar.find().exec();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
