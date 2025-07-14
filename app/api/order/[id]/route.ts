import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import Order from "@/models/Order.model";
import Product from "@/models/Product.model";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  const params = await context.params;
  const { id } = params;

  try {
    await connectToMongoDB();

    await Customer.db.asPromise();
    await Product.db.asPromise();

    const order = await Order.findById(id)
      .populate("orderItems.product")
      .populate("customer");

    return NextResponse.json(order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      {
        error: `Failed to fetch the order of user id: ${id}`,
        details: message,
      },
      { status: 500 }
    );
  }
}
