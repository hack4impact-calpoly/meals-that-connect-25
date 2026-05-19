import { clerkClient } from "@clerk/nextjs/server";
import User from "@/database/UserSchema";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name")?.trim().toLowerCase();
  const roleFilter = searchParams.get("role");
  const sortBy = searchParams.get("sortBy") ?? "";

  const filter: any = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (roleFilter) {
    const roles = roleFilter
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);
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

  let query = User.find(filter).sort(sort);

  if (sortBy === "aToZ" || sortBy === "zToA") {
    query = query.collation({ locale: "en", strength: 2 });
  }

  const dbUsers = await query;

  return NextResponse.json(dbUsers);
}
