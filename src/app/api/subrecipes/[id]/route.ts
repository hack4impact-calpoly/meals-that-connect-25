import { NextRequest, NextResponse } from "next/server";
import connectDB, { getSubrecipeById } from "@/database/db";
import Subrecipe from "@/database/SubrecipeSchema";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Subrecipe ID is required" }, { status: 400 });
  }

  try {
    const getSubrecipe = await getSubrecipeById(id);

    if (!getSubrecipe) {
      return NextResponse.json({ error: "Subrecipe not found" }, { status: 404 });
    }

    return NextResponse.json(getSubrecipe, { status: 200 });
  } catch (err) {
    console.error("Error fetching subrecipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  console.log("ID IS HERE: ", id);
  if (!id) {
    return NextResponse.json({ error: "Subrecipe ID is required" }, { status: 400 });
  }

  let updates = {};
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();
    const updatedRecipe = await Subrecipe.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true, // return the updated document instead of the original
        runValidators: true, // otherwise could bypass schema validation
        strict: "throw", // throw error on unknown fields
      },
    );

    if (!updatedRecipe) {
      return NextResponse.json({ error: "Subrecipe not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ValidationError" || err?.name === "StrictModeError") {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    console.error("Error updating subrecipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing Subrecipe ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedRecipe = await Subrecipe.findByIdAndDelete(id);

    if (!deletedRecipe) {
      return NextResponse.json({ error: "Subrecipe not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subrecipe deleted successfully", id: deletedRecipe._id }, { status: 200 });
  } catch (err: any) {
    console.error("Error deleting subrecipe:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
