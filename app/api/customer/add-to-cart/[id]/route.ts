import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    console.log('product id: ', productId)
    console.log('customer id: ', id)

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      { $push: { cartProducts: new mongoose.Types.ObjectId(productId) } },
      { new: true }
    );

    console.log(updatedCustomer, "updatedCustomer");

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error in PATCH /add-to-cart route:", error);
    return NextResponse.json(
      { message: "Failed to update customer", error },
      { status: 500 }
    );
  }
}
