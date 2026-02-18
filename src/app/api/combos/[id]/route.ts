import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";

type Params = {
  params: {
    id: string;
  };
};

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Combo ID is required" }, { status: 400 });
  }

  try {
    await connectDB();
    const combo = await Combo.findById(id);

    if (!combo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }

    return NextResponse.json(combo, { status: 200 });
  } catch (err) {
    console.error("Error fetching combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Combo ID is required" }, { status: 400 });
  }

  let updates = {};
  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();
    const updatedCombo = await Combo.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        strict: "throw",
      },
    );

    if (!updatedCombo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCombo, { status: 200 });
  } catch (err: any) {
    if (err?.name === "ValidationError" || err?.name === "StrictModeError") {
      return NextResponse.json({ error: "Invalid Data" }, { status: 400 });
    }
    console.error("Error updating combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing Combo ID" }, { status: 400 });
  }

  try {
    await connectDB();
    const deletedCombo = await Combo.findByIdAndDelete(id);

    if (!deletedCombo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Combo deleted successfully", id: deletedCombo._id }, { status: 200 });
  } catch (err) {
    console.error("Error deleting combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
