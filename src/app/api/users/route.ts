import User from "@/database/UserSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const name = searchParams.get("name")?.trim();
    const roles = searchParams
      .getAll("role")
      .map((role) => role.trim())
      .filter(Boolean);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const sortBy = searchParams.get("sortBy") ?? "createdDate";

    const filter: any = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (roles.length > 0) {
      filter.role = { $in: roles };
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

    const totalCount = await User.countDocuments(filter);

    let query = User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    if (sortBy === "aToZ" || sortBy === "zToA") {
      query = query.collation({ locale: "en", strength: 2 });
    }

    const users = await query;

    return NextResponse.json(
      {
        data: users,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
