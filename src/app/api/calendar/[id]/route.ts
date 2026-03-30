import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Calendar from "@/database/CalendarSchema";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Calendar ID is required" }, { status: 400 });
  }

  try {
    await connectDB();

    const calendarDay = await Calendar.findById(id).populate("entrees").populate("fruits").populate("sides").exec();

    if (!calendarDay) {
      return NextResponse.json({ error: "Calendar day not found" }, { status: 404 });
    }

    return NextResponse.json(calendarDay, { status: 200 });
  } catch (err) {
    console.error("Error fetching calendar day:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
