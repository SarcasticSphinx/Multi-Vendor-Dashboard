import { connectToMongoDB } from "@/lib/mongoose";
import Seller from "@/models/Seller.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const id = params.id;
  try {
    await connectToMongoDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid seller ID format" },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({
      user: new mongoose.Types.ObjectId(id),
    }).populate("user");

    if (!seller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(seller);
  } catch (error) {
    console.error("Error fetching seller:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const id = params.id;
  try {
    await connectToMongoDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid seller ID format" },
        { status: 400 }
      );
    }

    const updates = await req.json();
    const updatedSeller = await Seller.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      updates,
      { new: true }
    );

    if (!updatedSeller) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSeller);
  } catch (error) {
    console.error("Error updating seller:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
