import { connectToMongoDB } from "@/lib/mongoose";
import Order from "@/models/Order.model";
// import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const formData = await req.json();
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

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);

    const sellerId = searchParams.get("sellerId");
    const customerId = searchParams.get("customerId");

    const query: { sellerId?: string; customerId?: string } = {};

    if (sellerId) {
      query.sellerId = sellerId;
    } else if (customerId) {
      query.customerId = customerId;
    } else {
      return NextResponse.json(
        { message: "Missing sellerId or customerId parameter." },
        { status: 400 }
      );
    }

    const orders = await Order.find(query);

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to fetch orders", details: message },
      { status: 500 }
    );
  }
}


