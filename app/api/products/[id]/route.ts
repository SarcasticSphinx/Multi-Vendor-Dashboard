import { connectToMongoDB } from "@/lib/mongoose";
import Product from "@/models/Product.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await connectToMongoDB();
    const product = await Product.findById(id);

    return NextResponse.json(product);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: `Failed to fetch the product of id: ${id}`, details: message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    const updates = await req.json();

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update product", details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const { id } = params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to delete product", details: message },
      { status: 500 }
    );
  }
}
