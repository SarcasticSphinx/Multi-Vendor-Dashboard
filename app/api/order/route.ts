import { connectToMongoDB } from "@/lib/mongoose";
import Order from "@/models/Order.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const formData = await req.json();
    console.log("Received order data:", formData);
    const createdOrder = await Order.create(formData);

    return NextResponse.json(createdOrder);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}
