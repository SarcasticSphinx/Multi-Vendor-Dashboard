import { connectToMongoDB } from "@/lib/mongoose";
import Seller from "@/models/Seller.model";
import User from "@/models/User.model"; // Import User model
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();

    const sellerData = await req.json();
    const { user } = sellerData;

    if (!user) {
      return NextResponse.json(
        { error: "Missing user ID in request" },
        { status: 400 }
      );
    }

    
    const newSeller = await Seller.create(sellerData);

    await User.findByIdAndUpdate(user, { role: "seller" });

    return NextResponse.json(newSeller, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Seller creation failed:", message);
    return NextResponse.json(
      { error: "Failed to create Seller", details: message },
      { status: 500 }
    );
  }
}
