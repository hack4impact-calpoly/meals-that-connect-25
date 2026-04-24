import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/database/db";
import User from "@/database/UserSchema";

// upserts the logged-in Clerk user into MongoDB
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await dbConnect();

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || email;

  const user = await User.findOneAndUpdate(
    { clerkId: userId },
    {
      clerkId: userId,
      email,
      name,
      imageUrl: clerkUser.imageUrl,
      lastLoginDate: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return NextResponse.json({ role: user.role });
}
