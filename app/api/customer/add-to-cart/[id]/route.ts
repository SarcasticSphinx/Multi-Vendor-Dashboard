import { connectToMongoDB } from "@/lib/mongoose";
import Customer from "@/models/Customer.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";
type Params = Promise<{ id: string }>;

export async function PATCH(req: NextRequest, context: { params: Params }) {
  try {
    await connectToMongoDB();
    const params = await context.params;
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const quantity = parseInt(searchParams.get("quantity") || "1")

    console.log("product id: ", productId);
    console.log("user id: ", id);
    console.log("quantity: ", quantity);

    // await axiosInstance.patch(`/customer/add-to-cart/${session?.user.id}?productId=${product._id}&quantity=${quantity}`);

    if (!productId) {
      return NextResponse.json(
        { error: "Missing productId in query" },
        { status: 400 }
      );
    }

    const updatedCustomer = await Customer.findOneAndUpdate(
      { user: new mongoose.Types.ObjectId(id) },
      {
        $push: {
          cartProducts: {
            productId: new mongoose.Types.ObjectId(productId),
            quantity: quantity,
          },
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
    console.error("Error in PATCH /add-to-cart route:", error);
    return NextResponse.json(
      { message: "Failed to update customer", error },
      { status: 500 }
    );
  }
}
