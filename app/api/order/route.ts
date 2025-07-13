import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import Order from "@/models/Order.model";
import Seller from "@/models/Seller.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const formData = await req.json();

    const customerId = formData.customer;
    if (!customerId) {
      return NextResponse.json(
        { error: "Customer ID is required to create an order." },
        { status: 400 }
      );
    }

    const createdOrder = await Order.create(formData);

    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(customerId) },
      { $push: { orders: createdOrder._id } },
      { new: true }
    );

    if (!updatedCustomer) {
      await Order.findByIdAndDelete(createdOrder._id);
      return NextResponse.json(
        { error: "Customer not found. Order creation rolled back." },
        { status: 404 }
      );
    }

    const populatedOrder = await Order.findById(createdOrder._id).populate(
      "orderItems.product"
    );

    if (!populatedOrder) {
      console.error("Failed to populate created order.");
      return NextResponse.json(
        { error: "Failed to process order for sellers." },
        { status: 500 }
      );
    }

    const uniqueSellerIds = new Set<string>();

    populatedOrder.orderItems.forEach(
      (item: { product: { sellerId: mongoose.Types.ObjectId } }) => {
        if (item.product && item.product.sellerId) {
          uniqueSellerIds.add(item.product.sellerId.toString());
        }
      }
    );

    const sellerUpdatePromises = Array.from(uniqueSellerIds).map(
      async (sellerId) => {
        await Seller.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectId(sellerId) },
          { $push: { orders: createdOrder._id } },
          { new: true }
        );
      }
    );

    await Promise.all(sellerUpdatePromises);

    return NextResponse.json(createdOrder, { status: 200 });
  } catch (error) {
    console.error("Error creating order:", error);
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
