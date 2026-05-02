import { NextRequest, NextResponse } from "next/server";
import connectDB, { getRecipeById } from "@/database/db";
import User from "@/database/UserSchema";
import { clerkClient } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log("ID IS HERE: ", id);

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  let updates = {};
  try {
    updates = await req.json();
    console.log("2. UPDATES RECIEVED:", updates);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    console.log("3. ATTEMPTING DB CONNECTION..");
    await connectDB();
    console.log("4. DB CONNECTED SUCCESS");
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      console.log("5. FAILURE: USER NOT FOUND IN DB");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("5. SUCCESS USER UPDATED IN DB");
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err: any) {
    console.error("DATABASE ERROR:", err);
    if (err?.name === "ValidationError" || err?.name === "StrictModeError") {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    console.error("Error updating recipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
