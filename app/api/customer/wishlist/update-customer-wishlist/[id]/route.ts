import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>;



export async function POST(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    // await axiosInstance.patch(`/customer/update-customer-wishlist/${session?.user.id}?productId=${product._id}`);

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      {
        $addToSet: { // Use $addToSet to prevent duplicate product IDs in the wishlist
          wishlist: new mongoose.Types.ObjectId(productId), // Pushing only the ObjectId
        },
      },
      { new: true }
    );


    // console.log(updatedCustomer, "updatedCustomer");

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: "customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("Error in PATCH /add-to-wishlist route:", error);
    return NextResponse.json(
      { message: "Failed to update customer ", error },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;

    // Validate customerId from path parameter
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: `Invalid customer ID format: ${id}` },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId"); 

    if (!productId) {
      return NextResponse.json(
        { message: "Missing productId in query" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return NextResponse.json(
        { message: `Invalid productId format: ${productId}` },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      {
        $pull: {
          wishlist: new mongoose.Types.ObjectId(productId), 
        },
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json(
        { message: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { wishlist: updatedCustomer.wishlist },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Error in DELETE /customer/update-customer-wishlist/[id] route:",
      error
    );
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { message: "Failed to remove product from wishlist", details: message },
      { status: 500 }
    );
  }
}
