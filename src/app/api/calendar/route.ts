import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import "@/database/RecipeSchema";
import Calendar from "@/database/CalendarSchema";
import { RECIPE_BUCKETS } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const searchParams = req.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month")?.padStart(2, "0");
    const populate = searchParams.get("populate");

    const populateSelectMap = {
      // "all" just populates everything, no map needed
      preview: "_id name category",
      nutrition: "_id name category serving nutritional_info",
      filters: "_id name serving category proteinSources dietary exclusions",
    } as const;

    const baseFilter =
      year && month
        ? {
            _id: { $regex: `^${year}${month}` },
          }
        : {};

    const query = Calendar.find(baseFilter);

    if (populate === "all") {
      RECIPE_BUCKETS.forEach((bucket) => {
        query.populate(bucket);
      });
    } else if (populate === "preview" || populate === "nutrition" || populate === "filters") {
      RECIPE_BUCKETS.forEach((bucket) => {
        query.populate(bucket, populateSelectMap[populate]);
      });
    } else if (populate) {
      return NextResponse.json(
        {
          error: "Invalid populate value. Use all, preview, nutrition, or filters.",
        },
        { status: 400 },
      );
    }

    const result = await query.exec();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
