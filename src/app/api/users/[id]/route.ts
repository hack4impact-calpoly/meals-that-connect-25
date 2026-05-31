import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import User from "@/database/UserSchema";
import { clerkClient } from "@clerk/nextjs/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  let updates = {};
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();
    const updatedUser = await User.findOneAndUpdate(
      { _id: id },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ValidationError" || err?.name === "StrictModeError") {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    console.error("Error updating user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing Recipe ID" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ _id: id });
    const clerkId = user?.clerkId;

    const client = await clerkClient();
    try {
      await client.users.deleteUser(clerkId);
    } catch (clerkErr) {
      console.error("Clerk Delete Error:", clerkErr);
    }

    const deletedUser = await User.findOneAndDelete({ _id: id });

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User delete successfully", id: deletedUser._id }, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
