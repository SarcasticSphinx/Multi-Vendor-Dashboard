import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order.model";
type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;

    //dummy request to register the seller model and product model
    await Order.findOne({ user: id });

    // console.log(id, "User ID from params");
    const customer = await Customer.findOne({
      user: new mongoose.Types.ObjectId(id),
    }).populate({
      path: "orders",
      model: "Order",
    })

    // console.log(customer.orders, "Customer orders fetched by user ID");

    return NextResponse.json({
      orders: customer.orders,
    });
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
