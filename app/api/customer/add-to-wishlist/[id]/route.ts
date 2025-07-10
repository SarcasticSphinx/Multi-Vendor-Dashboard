import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>;

export async function PATCH(
  req: NextRequest,
  context: { params: Params }
) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      { $push: { wishlist: new mongoose.Types.ObjectId(productId) } },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update customer", details: message },
      { status: 500 }
    );
  }
}
