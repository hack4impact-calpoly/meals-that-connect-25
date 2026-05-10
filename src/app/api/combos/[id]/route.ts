import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/database/db";
import Combo from "@/database/ComboSchema";
import { RecipeBuckets } from "@/lib/types";
import { deriveComboDataFromRecipeIds, getFinalRecipeBuckets } from "@/lib/server/comboHelpers";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params;

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Combo ID is required" }, { status: 400 });
  }

  let updates: Record<string, unknown>;

  try {
    updates = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    await connectDB();

    const existingCombo = await Combo.findById(id)
      .select("entrees vegetables fruits grains")
      .lean<RecipeBuckets<string>>();

    if (!existingCombo) {
      return NextResponse.json({ error: "Combo not found" }, { status: 404 });
    }

    // get all recipes in this combo, including updates
    const finalRecipeBuckets = getFinalRecipeBuckets(updates, existingCombo);
    // aggregate the filters
    const calculatedFilters = await deriveComboDataFromRecipeIds(finalRecipeBuckets);

    const updatedCombo = await Combo.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updates,

          // The client cannot set the filters directly
          // here we overwrite any client data with our own calculations
          ...calculatedFilters,
        },
      },
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

    if (err?.message?.includes("Invalid") || err?.message?.includes("could not be found")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    console.error("Error updating combo:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;

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
