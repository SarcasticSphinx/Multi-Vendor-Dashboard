import { connectToMongoDB } from "@/lib/mongoose";
import Seller from "@/models/Seller.model";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  const params = await context.params
  const id = params.id;

  try {
    await connectToMongoDB();
    const seller = await Seller.findOne({ user: id }).populate("user");

    return NextResponse.json(seller);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: `Failed to fetch the Seller of id: ${id}`, details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: {params: Params}
) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const updates = await req.json();

    const updatedSeller = await Seller.findOneAndUpdate(
      { user: id },
      updates,
      {
        new: true,
      }
    );

    if (!updatedSeller) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSeller);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update Seller", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Params }
) {
  try {
    await connectToMongoDB();
    const params = await context.params;

    const { id } = params;
    const deletedSeller = await Seller.findOneAndDelete({ user: id });

    if (!deletedSeller) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Seller deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to delete Seller", details: message },
      { status: 500 }
    );
  }
}
