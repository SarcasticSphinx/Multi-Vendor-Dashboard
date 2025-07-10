import { connectToMongoDB } from "@/lib/mongoose";
import Product from "@/models/Product.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");
    const products = await Product.find({sellerId}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to fetch products", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToMongoDB();
    const data = await req.json();
    // console.log("Received Product Data:", data); 

    const newProduct = await Product.create(data);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    console.error("Product creation failed:", message);
    return NextResponse.json(
      { error: "Failed to create product", details: message },
      { status: 500 }
    );
  }
}

