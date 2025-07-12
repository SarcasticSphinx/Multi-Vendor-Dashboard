import { connectToMongoDB } from "@/lib/mongoose";
import Product from "@/models/Product.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectToMongoDB();
    const { searchParams } = new URL(req.url);

    const sellerIdParam = searchParams.get("sellerId");
    const idsParam = searchParams.get("ids");

    const query: {
      sellerId?: mongoose.Types.ObjectId;
      _id?: { $in: mongoose.Types.ObjectId[] };
    } = {};

    if (sellerIdParam && mongoose.Types.ObjectId.isValid(sellerIdParam)) {
      query.sellerId = new mongoose.Types.ObjectId(sellerIdParam);
    } else if (sellerIdParam) {
      return NextResponse.json(
        { message: `Invalid sellerId format: ${sellerIdParam}` },
        { status: 400 }
      );
    }

    if (idsParam) {
      const idStrings = idsParam.split(",");
      const validObjectIds: mongoose.Types.ObjectId[] = [];

      idStrings.forEach((idStr) => {
        if (mongoose.Types.ObjectId.isValid(idStr)) {
          validObjectIds.push(new mongoose.Types.ObjectId(idStr));
        }
      });

      if (validObjectIds.length > 0) {
        query._id = { $in: validObjectIds };
      } else if (idStrings.length > 0) {
        return NextResponse.json(
          { message: "No valid product IDs provided in 'ids' parameter." },
          { status: 400 }
        );
      }
    }

    const products = await Product.find(query);

    if (products.length === 0) {
      return NextResponse.json({ products: [] }, { status: 200 });
    }

    return NextResponse.json({ products: products }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("Error fetching products:", error);
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
