import { connectToMongoDB } from "@/lib/mongoose";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import Order from "@/models/Order.model"; // Make sure Order model is correctly imported and defined
import Seller from "@/models/Seller.model"; // Make sure Seller model is correctly imported and defined

// Define the type for context.params
type Params = { id: string };

export async function GET(req: NextRequest, context: { params: Params }) {
    const params = await context.params;
  const id = params.id;
  try {
    await connectToMongoDB();

    console.log(id, "User ID from params");

    // Optional: Dummy request only needed if models are not pre-registered (e.g., in a fresh serverless function instance)
    // If your models are consistently registered (e.g., via a global mongoose.model call), this might not be strictly necessary.
    // However, it doesn't hurt and ensures models are loaded.
    await Order.db.asPromise(); // Ensures models are registered and available
    await Seller.db.asPromise(); // Same for Seller

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: `Invalid User ID format provided: ${id}` },
        { status: 400 }
      );
    }

    const seller = await Seller.findOne({
      user: new mongoose.Types.ObjectId(id),
    })
      .populate("user")
      .populate({
        path: "orders",
        model: "Order",
        populate: {
          path: "customer",
          model: "Customer",
        },
      });

    if (!seller) {
      return NextResponse.json(
        { message: `Seller profile not found for user ID: ${id}` },
        { status: 404 }
      );
    }

    // console.log(seller.orders, "Seller orders fetched by user ID");

    return NextResponse.json({
      orders: seller.orders,
    });
  } catch (error: unknown) {
    console.error("GET Seller Orders Error:", error);

    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";

    return NextResponse.json(
      { message: "Failed to fetch seller orders.", error: message },
      { status: 500 }
    );
  }
}
