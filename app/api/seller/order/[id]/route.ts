import { connectToMongoDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order.model";
import Seller from "@/models/Seller.model";
type Params = Promise<{ id: string }>;

export async function GET(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;

    console.log(id, "User ID from params");

    //dummy request to register the seller model and product model
    await Order.findOne({ user: id });

    // console.log(id, "User ID from params");
    const seller = await Seller.findOne({
      user: new mongoose.Types.ObjectId(id),
    }).populate({
      path: "orders",
      model: "Order",
    }).populate({
      path: "customer",
      model: "Customer",
    });

    // console.log(seller.orders, "Seller orders fetched by user ID");

    return NextResponse.json({
      orders: seller.orders,
    });
  } catch (error) {
    console.error("Fetch Customer Error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json(
      { message: "Failed to fetch seller orders by user id", error: message },
      { status: 500 }
    );
  }
}
