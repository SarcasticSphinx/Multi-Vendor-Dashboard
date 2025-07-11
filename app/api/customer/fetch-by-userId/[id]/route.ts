import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;

    // console.log(id, "User ID from params");

    const customer = await Customer.findOne({
      user: new mongoose.Types.ObjectId(id),
    })
    .populate({ path: "cartProducts.productId", model: "Product" });

    // console.log(customer, "Customer fetched by user ID");

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Fetch Customer Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { message: "Failed to fetch customer by user id", error: message },
      { status: 500 }
    );
  }
}
